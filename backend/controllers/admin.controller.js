import Match from '../model/match.model.js'
import {io} from "../app.js"

export const matchInit = async (req, res) => {
    try {
        const { team1, team2, overs, team1Players, team2Players, battingFirst } = req.body;

        const battingTeam = battingFirst === team1 ? team1 : team2;
        const bowlingTeam = battingFirst === team1 ? team2 : team1;
        const battingPlayers = battingFirst === team1 ? team1Players : team2Players;
        const bowlingPlayers = battingFirst === team1 ? team2Players : team1Players;

        // match with initialized teams and bowlers (empty for now)
        const match = await Match.create({
            team1: battingTeam,
            team2: bowlingTeam,
            overs,
            team1Players: battingPlayers,
            team2Players: bowlingPlayers,
            status: "In Progress",
        });

        match.commentary.push(`Match initialized between ${team1} and ${team2}.`);
        match.commentary.push(`${battingTeam} is batting first.`);

        await match.save();

        io.emit('match_updated', match);
        res.status(200).json({
            success: true,
            message: "Match initialized successfully",
            match,
        });
    } catch (error) {
        console.error("Error initializing match:", error);
        res.status(500).json({ success: false, error: "Internal Server Error" });
    }
};

export const inningsInit = async (req, res) => {
    try {
        const { match_id, striker, nonStriker, currentBowler } = req.body;
        const match = await Match.findById(match_id);

        if (!match) {
            return res.status(404).json({ success: false, error: "Match not found" });
        }

        const currentBattingTeam = match.currentInning === 1 ? match.team1Players : match.team2Players;
        const currentBowlingTeam = match.currentInning === 1 ? match.team2Players : match.team1Players;

        const batsmanExists = currentBattingTeam.some(player => player.name === striker);
        const nonStrikerExists = currentBattingTeam.some(player => player.name === nonStriker);
        const bowlerExists = currentBowlingTeam.some(player => player.name === currentBowler);

        if (!batsmanExists) {
            return res.status(400).json({ success: false, error: "Striker not found in the current batting team" });
        }

        if (!nonStrikerExists) {
            return res.status(400).json({ success: false, error: "Non-Striker not found in the current batting team" });
        }

        if (!bowlerExists) {
            return res.status(400).json({ success: false, error: "Bowler not found in the current bowling team" });
        }

        // first batsman, non-striker, and bowler
        match.currentBatsman = striker;
        match.nonStriker = nonStriker;
        match.currentBowler = currentBowler;

        match.commentary.push(`Inning ${match.currentInning} is about to start.`);
        match.commentary.push(`Striker: ${striker}, Non-Striker: ${nonStriker}, Bowler: ${currentBowler}.`);

        await match.save();
        io.emit('match_updated', match);
        res.status(200).json({
            success: true,
            message: "Inning initialized successfully",
            match,
        });
    } catch (error) {
        console.error("Error initializing inning:", error);
        res.status(500).json({ success: false, error: "Internal Server Error" });
    }
};


export const updateScore = async (req, res) => {
    try {
        const { match_id, playerRuns, additionalRuns, isExtraBall, isOut, commentary } = req.body;
        const match = await Match.findById(match_id);

        if (!match) {
            return res.status(404).json({ success: false, error: "Match not found" });
        }

        if (match.currentOver >= match.overs) {
            return res.status(400).json({
                success: false, message: (match.currentInning === 1 ? "Innings change required" : "Call the match end api")
            })
        }

        if (!match.currentBatsman || !match.nonStriker || !match.currentBowler) {
            return res.status(400).json({
                success: false, message: "Bowlers / Batsmen are missing"
            })
        }

        const currentTeam = match.currentInning === 1 ? "team1" : "team2";
        const bowlingTeam = match.currentInning === 1 ? "team2" : "team1";
        const currentTeamScore = `${currentTeam}Score`;
        const currentTeamExtras = `${currentTeam}Extras`;
        const currentTeamPlayers = `${currentTeam}Players`;
        const currentBowlingTeam = `${bowlingTeam}Players`;

        const [currentRuns, currentWickets] = match[currentTeamScore].split("/").map(Number);

        // Update team score
        const newRuns = currentRuns + playerRuns + (additionalRuns || 0);
        const newWickets = isOut ? currentWickets + 1 : currentWickets;
        match[currentTeamScore] = `${newRuns}/${newWickets}`;

        // Update batsman stats
        const batsmanIndex = match[currentTeamPlayers].findIndex((player) => player.name === match.currentBatsman);
        const batsman = match[currentTeamPlayers][batsmanIndex];

        batsman.runs += playerRuns;
        batsman.ballsFaced += !isExtraBall;

        match.commentary.push(commentary);

        if (playerRuns === 4) batsman.fours += 1;
        if (playerRuns === 6) batsman.sixes += 1;

        if (isOut) {
            batsman.isOut = true;
            match.commentary.push(`${batsman.name} is out!`);
            match.currentBatsman = null;
        } else {
            // Rotate strike on odd runs
            if (playerRuns % 2 !== 0) {
                [match.currentBatsman, match.nonStriker] = [match.nonStriker, match.currentBatsman];
            }
        }

        // Update bowler stats
        const bowlerIndex = match[currentBowlingTeam].findIndex((player) => player.name === match.currentBowler);
        if (bowlerIndex === -1) {
            return res.status(404).json({ success: false, error: "Current bowler not found" });
        }

        const bowler = match[currentBowlingTeam][bowlerIndex];

        // Update bowler runs conceded
        bowler.runsConceded += playerRuns + (additionalRuns || 0);

        // Handle extras for the bowler
        if (isExtraBall) {
            bowler.extras += additionalRuns;
        } else {
            // Increment legitimate balls bowled
            const currentOvers = bowler.overs;
            const fractionalOvers = Math.floor(currentOvers) + (currentOvers % 1) + 0.1;
            bowler.overs = fractionalOvers >= 0.6 ? Math.ceil(fractionalOvers) : fractionalOvers;
        }

        if (isOut) {
            bowler.wickets += 1;
        }

        if (isExtraBall) {
            match[currentTeamExtras] += additionalRuns;
        } else {
            match.currentBall += 1;

            // End of over
            if (match.currentBall >= 6) {
                match.currentBall = 0;
                match.currentOver += 1;
                [match.currentBatsman, match.nonStriker] = [match.nonStriker, match.currentBatsman];
                match.commentary.push(`End of over ${match.currentOver}. Score: ${match[currentTeamScore]}.`);
                match.currentBowler = null;
            }
        }

        if (match.currentInning == 1 && (match.currentOver == match.overs || currentWickets === 10)) {
            match.commentary.push(`End of the innings ${match.currentInning}. ${match.team2} needs ${newRuns + 1} to win the match.`);
            match.currentBatsman = null;
            match.nonStriker = null;
            match.currentBowler = null;
        }

        if (match.currentInning == 2) {
            if (newRuns > match.team1Score.split('/').map(Number)[0]) {
                match.commentary.push(`${match.team2} won the match by ${10 - currentWickets} wickets`);
                match.currentBatsman = null;
                match.nonStriker = null;
                match.currentBowler = null;
            }
            else if (match.currentOver == match.overs || currentWickets === 10) {
                if (newRuns < match.team1Score.split('/')[0].map(Number)) {
                    match.commentary.push(`${match.team1} won the match by ${match.team1Score.split('/').map(Number)[0] - newRuns} runs`);
                }
                else match.commentary.push(`The match is drawn`);

                match.currentBatsman = null;
                match.nonStriker = null;
                match.currentBowler = null;
            }
        }

        await match.save();
        io.emit('match_updated', match);
        res.status(200).json({
            success: true,
            message: "Score and bowler stats updated successfully",
            match,
        });
    } catch (error) {
        console.error("Error updating score:", error);
        res.status(500).json({ success: false, error: "Internal Server Error" });
    }
};

export const startNewOver = async (req, res) => {
    try {
        const { match_id, newBowler } = req.body;

        const match = await Match.findById(match_id);

        if (!match) {
            return res.status(404).json({ success: false, error: "Match not found" });
        }

        if (match.currentBall !== 0) {
            return res.status(400).json({
                success: false,
                error: "Cannot start a new over until the current one is completed.",
            });
        }

        match.currentBowler = newBowler;

        // Check if the bowler exists in the opposing team's bowlers
        const currentTeamBowlers =
            match.currentInning === 1 ? match.team2Players : match.team1Players;
        const bowlerIndex = currentTeamBowlers.findIndex((player) => player.name === newBowler);

        if (bowlerIndex === -1) {
            return res.status(404).json({ success: false, error: "Bowler not found in the team." });
        }

        // Add commentary
        match.commentary.push(`New over started. Bowler: ${newBowler}.`);

        await match.save();
        io.emit('match_updated', match);
        res.status(200).json({
            success: true,
            message: "New over started successfully.",
            match,
        });
    } catch (error) {
        console.error("Error starting new over:", error);
        res.status(500).json({ success: false, error: "Internal Server Error" });
    }
};

export const completeInning = async (req, res) => {
    try {
        const { match_id } = req.body;
        const match = await Match.findById(match_id);

        if (!match) {
            return res.status(404).json({ success: false, error: "Match not found" });
        }

        const currentTeam = match.currentInning === 1 ? "team1" : "team2";
        const currentTeamScore = `${currentTeam}Score`;

        match.commentary.push(`End of inning ${match.currentInning}. Final score: ${match[currentTeamScore]}.`);

        if (match.currentInning === 1) {
            // Transition to the second inning
            match.currentInning = 2;
            match.currentOver = 0;
            match.currentBall = 0;
            match.currentBatsman = null;
            match.nonStriker = null;
            match.currentBowler = null;

            match.commentary.push(`Team ${match.team2} starts batting.`);
        } else {
            // Match concluded after the second inning
            match.status = "Completed";
            match.commentary.push(`Match concluded. Final scores: Team ${match.team1}: ${match.team1Score}, Team ${match.team2}: ${match.team2Score}.`);
        }

        await match.save();
        io.emit('match_updated', match);
        res.status(200).json({
            success: true,
            message: match.currentInning === 2 ? "Match completed." : "Inning completed.",
            match,
        });
    } catch (error) {
        console.error("Error completing inning:", error);
        res.status(500).json({ success: false, error: "Internal Server Error" });
    }
};

export const addNewBatsman = async (req, res) => {
    try {
        const { match_id, newBatsman } = req.body; // New batsman's name
        const match = await Match.findById(match_id);

        if (!match) {
            return res.status(404).json({ success: false, error: "Match not found" });
        }

        // Determine which team is currently batting
        const currentTeamPlayers = match.currentInning === 1 ? match.team1Players : match.team2Players;

        const nextBatsmanIndex = currentTeamPlayers.findIndex((player) => player.name === newBatsman && !player.isOut);

        if (nextBatsmanIndex === -1) {
            return res.status(400).json({
                success: false,
                error: "Replacement batsman not found or is already out.",
            });
        }
        
        // Replace the current batsman with the new batsman
        if (!match.currentBatsman) match.currentBatsman = newBatsman;
        else match.nonStriker = newBatsman;

        // Update the commentary
        match.commentary.push(`${newBatsman} comes in to bat.`);

        // Save the updated match data
        await match.save();
        io.emit('match_updated', match);
        res.status(200).json({
            success: true,
            message: "New batsman added successfully.",
            match,
        });
    } catch (error) {
        console.error("Error adding new batsman:", error);
        res.status(500).json({ success: false, error: "Internal Server Error" });
    }
};

export const getMatch = async (req, res) => {
    try {
        const match = await Match.findOne();

        if (!match) {
            return res.status(404).json({ success: false, message: "Match not found" });
        }

        res.status(200).json({ success: true, match });
    } catch (error) {
        console.error("Error fetching match:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};