import useGetMatch from '@/hooks/useGetMatch';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { io } from 'socket.io-client';

const ViewerPanel = () => {
    const [match, setMatch] = useState(null);

    useEffect(() => {
        // Connect to the socket server
        const socket = io('http://localhost:8000'); // Make sure this matches your server URL

        // Listen for the 'match_updated' event
        socket.on('match_updated', (updatedMatch) => {
            setMatch(updatedMatch); // Update the state with the new match data
            setStats(calculateStats(updatedMatch));
        });

        // Cleanup on component unmount
        return () => {
            socket.off('match_updated'); // Remove the event listener
            socket.disconnect(); // Disconnect the socket
        };
    }, []);

    const [stats, setStats] = useState({});

    const { loading, getMatch } = useGetMatch();

    const calculateStats = (matchData) => {
        const team1Runs = Number(matchData?.team1Score?.split('/')[0]) || 0;
        const team2Runs = Number(matchData?.team2Score?.split('/')[0]) || 0;
        const team2Wickets = Number(matchData?.team2Score?.split('/')[1]) || 0;

        const difference = team1Runs - team2Runs + 1;

        const batsman =
            matchData?.currentInning === 1
                ? matchData?.team1Players?.find(player => player?.name === matchData?.currentBatsman)
                : matchData?.team2Players?.find(player => player?.name === matchData?.currentBatsman);

        const nonStriker =
            matchData?.currentInning === 1
                ? matchData?.team1Players?.find(player => player?.name === matchData?.nonStriker)
                : matchData?.team2Players?.find(player => player?.name === matchData?.nonStriker);

        const bowler =
            matchData?.currentInning === 2
                ? matchData?.team1Players?.find(player => player?.name === matchData?.currentBowler)
                : matchData?.team2Players?.find(player => player?.name === matchData?.currentBowler);

        return { team1Runs, team2Runs, team2Wickets, difference, batsman, nonStriker, bowler };
    };

    useEffect(() => {
        console.log("Updated stats:", stats);
    }, [stats]);

    useEffect(() => {
        async function fetchMatch() {
            try {
                const data = await getMatch();
                if (data?.success) {
                    setMatch(data.match);
                    console.log(data.match)
                    setStats(calculateStats(data.match));
                    console.log(stats)
                } else {
                    toast.error(data?.message || data?.error || "Failed to fetch match data.");
                }
            } catch (error) {
                toast.error("An error occurred while fetching match data.");
                console.error(error);
            }
        }
        fetchMatch();
    }, []);

    const getMatchStatus = () => {
        if (match?.currentInning === 2) {
            if (stats.difference <= 0) {
                return `${match?.team2} won the match by ${10 - stats.team2Wickets} wickets`;
            }
            if (stats.team2Wickets < 10 && match?.currentOver < match?.overs) {
                return `${match?.team2} needs ${stats.difference} runs to win`;
            }
            return `${match?.team1} won the match by ${stats.difference - 1} runs`;
        }
        return null;
    };

    if (!match) {
        return <div>Loading match data...</div>;
    }

    return (
        <div className="bg-[#202124] text-[#bdc1c6] p-4 w-[800px]">
            {/* Teams Panel */}
            <div className="flex justify-between m-8 items-center">
                <TeamPanel
                    teamName={match?.team1}
                    score={match?.team1Score}
                    currentInning={match?.currentInning === 1}
                    overDetails={`${match?.currentOver}.${match?.currentBall}`}
                />
                <div>{`${match?.overs}-Overs Match`}</div>
                <TeamPanel
                    teamName={match?.team2}
                    score={match?.currentInning === 1 ? "Yet to bat" : match?.team2Score}
                    currentInning={match?.currentInning === 2}
                    overDetails={`${match?.currentOver}.${match?.currentBall}`}
                />
            </div>

            {/* Match Status */}
            <div className="flex justify-center items-center text-[#e8e8e8] ml-[-30px]">
                {getMatchStatus()}
            </div>

            {/* Batting and Bowling Stats */}
            {stats.batsman && stats.nonStriker && stats.bowler && (
                <PlayerStats
                    battingTeam={match?.currentInning === 1 ? match?.team1 : match?.team2}
                    bowlingTeam={match?.currentInning === 1 ? match?.team2 : match?.team1}
                    batsman={stats.batsman}
                    nonStriker={stats.nonStriker}
                    bowler={stats.bowler}
                />
            )}

            {/* Commentary Section */}
            <CommentarySection commentary={match?.commentary} />
        </div>
    );
};

const TeamPanel = ({ teamName, score, currentInning, overDetails }) => (
    <div className="flex flex-col items-center">
        <div className="font-bold text-lg text-[#e8e8e8]">{teamName}</div>
        <div>
            {score} {currentInning && `(${overDetails})`}
        </div>
    </div>
);

const PlayerStats = ({ battingTeam, bowlingTeam, batsman, nonStriker, bowler }) => (
    <div className="flex justify-between border-t-2 border-[#1b1c1e] mt-4">
        <div className="flex flex-col m-8">
            <div>{battingTeam} Batting</div>
            <div>{`${batsman?.name}: ${batsman?.runs || 0}* (${batsman?.ballsFaced || 0})`}</div>
            <div>{`${nonStriker?.name}: ${nonStriker?.runs || 0}* (${nonStriker?.ballsFaced || 0})`}</div>
        </div>
        <div className="flex flex-col m-8">
            <div>{bowlingTeam} Bowling</div>
            <div>{`${bowler?.name}: ${bowler?.runsConceded || 0} (${bowler?.overs || 0})`}</div>
        </div>
    </div>
);

const CommentarySection = ({ commentary }) => (
    <div className="flex flex-col mt-4 border-t-2 border-[#15171a] pt-2">
        <div className="text-center font-bold text-lg text-[#e8e8e8]">Commentary</div>
        <div className="overflow-y-auto h-[150px] border border-[#15171a] rounded-md p-2 mt-2">
            {commentary?.slice().reverse().map((comment, index) => (
                <div key={index} className="mb-1">
                    {comment}
                </div>
            ))}
        </div>
    </div>
);

export default ViewerPanel;
