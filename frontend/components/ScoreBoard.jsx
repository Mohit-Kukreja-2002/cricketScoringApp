import useAddNewBatsman from '@/hooks/match/useAddNewBatsman';
import useCompleteInnings from '@/hooks/match/useCompleteInnings';
import useInningsInit from '@/hooks/match/useInningInit';
import useStartNewOver from '@/hooks/match/useStartNewOver';
import useUpdateScore from '@/hooks/match/useUpdateScore';
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const ScoreBoard = ({ match, setMatch }) => {

    useEffect(() => {
        setBatsman(match.currentBatsman || "")
        setNonStriker(match.nonStriker || "")
        setBowler(match.currentBowler || "")
    }, [match])

    const [batsman, setBatsman] = useState(match.currentBatsman || "");
    const [nonStriker, setNonStriker] = useState(match.nonStriker || "");
    const [bowler, setBowler] = useState(match.currentBowler || "");

    const team1Players = match.team1Players;
    const team2Players = match.team2Players;

    // Get the players for each team based on the current inning
    const currentBattingTeam = match.currentInning === 1 ? team1Players : team2Players;
    const currentBowlingTeam = match.currentInning === 1 ? team2Players : team1Players;

    // Filter batsmen who are not out
    const availableBatsmen = currentBattingTeam.filter(player => !player.isOut);

    // Assume `team2Wickets` and `difference` are defined in match
    const team1Wickets = match.team1Score.split('/').map(Number)[1] || 0;
    const team1Runs = match.team1Score.split('/').map(Number)[0] || 0;
    const team2Wickets = match.team2Score.split('/').map(Number)[1] || 0;
    const team2Runs = match.team2Score.split('/').map(Number)[0] || 0;
    const difference = match.team1Score.split('/').map(Number)[0] - match.team2Score.split('/').map(Number)[0] + 1; // Assuming difference is the difference in scores

    // Handle changing the batsman, non-striker, and bowler
    const handleBatsmanChange = (e) => setBatsman(e.target.value);
    const handleNonStrikerChange = (e) => setNonStriker(e.target.value);
    const handleBowlerChange = (e) => setBowler(e.target.value);

    // Removed duplicate declarations here:
    const currentBatsman = match.currentInning === 1
        ? match.team1Players.find(player => player.name === match.currentBatsman)
        : match.team2Players.find(player => player.name === match.currentBatsman);

    const currentNonStriker = match.currentInning === 1
        ? match.team1Players.find(player => player.name === match.nonStriker)
        : match.team2Players.find(player => player.name === match.nonStriker);

    const currentBowler = match.currentInning === 2
        ? match.team1Players.find(player => player.name === match.currentBowler)
        : match.team2Players.find(player => player.name === match.currentBowler);


    const { completeInning } = useCompleteInnings();
    async function inningComplete(e) {
        e.preventDefault();
        const data = await completeInning({
            "match_id": match._id
        })

        if (data?.success === false) {
            toast.error(data?.message || data?.error);
        }
        if (data?.success === true) {
            setMatch(data?.match)
        }
    }

    const { loading: loadingInnings, inningsInit } = useInningsInit();
    async function initialiseInning(e) {
        e.preventDefault();
        const data = await inningsInit({
            "match_id": match._id,
            "striker": batsman,
            "nonStriker": nonStriker,
            "currentBowler": bowler,
        })
        if (data?.success === false) {
            toast.error(data?.message || data?.error);
        }
        if (data?.success === true) {
            setMatch(data?.match)
        }
    }

    const { loading: loadingUpdate, updateScore } = useUpdateScore();
    async function updateMatchScore(e, playerRuns, additionalRuns, isExtra, isOut, commentary) {
        e.preventDefault();
        const data = await updateScore({
            "match_id": match._id,
            "playerRuns": playerRuns,
            "additionalRuns": additionalRuns,
            "isExtraBall": isExtra,
            "isOut": isOut,
            "commentary": commentary
        })
        console.log("function called", data)
        if (data?.success === false) {
            toast.error(data?.message || data?.error);
        }
        if (data?.success === true) {
            setMatch(data?.match)
        }
    }

    const { loading: loadingNewBatsman, addNewBatsman } = useAddNewBatsman();
    async function addBatsman(e) {
        e.preventDefault();
        const data = await addNewBatsman({
            "match_id": match._id,
            "newBatsman": (match.currentBatsman ? nonStriker : batsman)
        })
        if (data?.success === false) {
            toast.error(data?.message || data?.error);
        }
        if (data?.success === true) {
            setMatch(data?.match)
        }
    }


    const { loading: loadingNewOver, startNewOver } = useStartNewOver();
    async function newOver(e) {
        e.preventDefault();
        const data = await startNewOver({
            "match_id": match._id,
            "newBowler": bowler
        })
        if (data?.success === false) {
            toast.error(data?.message || data?.error);
        }
        if (data?.success === true) {
            setMatch(data?.match)
        }
    }


    return (
        <div className='bg-[#202124] text-[#bdc1c6] p-4 h-full min-w-[800px] max-w-screen'>
            <div className='flex justify-between m-8 items-center'>
                <div className='flex flex-col items-center'>
                    <div className='font-bold text-lg text-[#e8e8e8]'>{match.team1}</div>
                    <div>
                        {match.team1Score}{" "}
                        {match.currentInning === 1 &&
                            `(${match.currentOver}.${match.currentBall})`}
                    </div>
                </div>

                <div>{`${match.overs}-Overs Match`}</div>

                <div className='flex flex-col items-center'>
                    <div className='font-bold text-lg text-[#e8e8e8]'>{match.team2}</div>
                    <div>
                        {match.currentInning === 1
                            ? "Yet to bat"
                            : match.team2Score}{" "}
                        {match.currentInning === 2 &&
                            `(${match.currentOver}.${match.currentBall})`}
                    </div>
                </div>
            </div>

            {/* Match Status */}
            <div className='flex justify-center items-center text-[#e8e8e8] ml-[-30px]'>
                {match.currentInning === 2 && difference <= 0 && (
                    `${match.team2} won the match by ${10 - team2Wickets} wickets`
                )}
                {match.currentInning === 2 && difference > 0 && (
                    team2Wickets < 10 && match.currentOver < match.overs
                        ? `${match.team2} needs ${difference} runs to win`
                        : `${match.team1} won the match by ${difference - 1} runs`
                )}
            </div>

            {currentBatsman && currentNonStriker && currentBowler && (
                <div className='flex justify-between border-t-2 border-[#1b1c1e] mt-4'>
                    <div className='flex flex-col m-8'>
                        <div>{match.currentInning === 1 ? match.team1 : match.team2} Batting</div>
                        <div>{`${currentBatsman.name}: ${currentBatsman.runs}* (${currentBatsman.ballsFaced})`}</div>
                        <div>{`${currentNonStriker.name}: ${currentNonStriker.runs} (${currentNonStriker.ballsFaced})`}</div>
                    </div>
                    <div className='flex flex-col m-8'>
                        <div>{match.currentInning === 1 ? match.team2 : match.team1} Bowling</div>
                        <div>{`${currentBowler.name}: ${currentBowler.runsConceded} (${currentBowler.overs})`}</div>
                    </div>
                </div>
            )}

            {
                match.status != "Completed" &&
                <>
                    <div className='mt-6 flex justify-between'>
                        {/* Batsman Dropdown */}
                        <div className='flex-1 mr-2'>
                            <label className='block text-[#e8e8e8]'>Select Batsman:</label>
                            <select
                                value={batsman}
                                onChange={handleBatsmanChange}
                                disabled={match.currentBatsman} // Disable if batsman is selected
                                className='p-2 rounded-md bg-[#3e4347] text-[#e8e8e8] w-full'>
                                <option value=''>Select Batsman</option>
                                {availableBatsmen.length > 0 ? (
                                    availableBatsmen.map((player, index) => (
                                        <option key={index} value={player.name}>{player.name}</option>
                                    ))
                                ) : (
                                    <option value=''>No available batsmen</option>
                                )}
                            </select>
                        </div>

                        {/* Non-Striker Dropdown */}
                        <div className='flex-1 mr-2'>
                            <label className='block text-[#e8e8e8]'>Select Non-Striker:</label>
                            <select
                                value={nonStriker}
                                onChange={handleNonStrikerChange}
                                disabled={match.nonStriker} // Disable if non-striker is selected
                                className='p-2 rounded-md bg-[#3e4347] text-[#e8e8e8] w-full'>
                                <option value=''>Select Non-Striker</option>
                                {availableBatsmen.length > 0 ? (
                                    availableBatsmen.map((player, index) => (
                                        <option key={index} value={player.name}>{player.name}</option>
                                    ))
                                ) : (
                                    <option value=''>No available batsmen</option>
                                )}
                            </select>
                        </div>

                        {/* Bowler Dropdown */}
                        <div className='flex-1'>
                            <label className='block text-[#e8e8e8]'>Select Bowler:</label>
                            <select
                                value={bowler}
                                onChange={handleBowlerChange}
                                disabled={match.currentBowler} // Disable if bowler is selected
                                className='p-2 rounded-md bg-[#3e4347] text-[#e8e8e8] w-full'>
                                <option value=''>Select Bowler</option>
                                {currentBowlingTeam.map((player, index) => (
                                    <option key={index} value={player.name}>{player.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className='grid grid-cols-4 gap-4 p-4'>
                        <Button
                            loadingNewBatsman={loadingNewBatsman}
                            loadingUpdate={loadingUpdate}
                            loadingInnings={loadingInnings}
                            onClick={(e) => initialiseInning(e)}
                            disable={(match.currentBatsman || match.nonStriker || match.currentBowler)}
                            label="Start New Innings"
                            color="#9c27b0"
                        />
                        <Button
                            loadingNewBatsman={loadingNewBatsman}
                            loadingUpdate={loadingUpdate}
                            loadingInnings={loadingInnings}
                            onClick={(e) => addBatsman(e)}
                            disable={!((!match.currentBatsman || !match.nonStriker))}
                            label="Add Batsman"
                            color="#6a0dad"
                        />
                        <Button
                            loadingNewBatsman={loadingNewBatsman}
                            loadingUpdate={loadingUpdate}
                            loadingInnings={loadingInnings}
                            onClick={(e) => newOver(e)}
                            disable={!(!match.currentBowler && (match.currentBatsman && match.nonStriker))}
                            label="Add Bowler"
                            color="#8d3b72"
                        />
                        <Button
                            loadingNewBatsman={loadingNewBatsman}
                            loadingUpdate={loadingUpdate}
                            loadingInnings={loadingInnings}
                            onClick={(e) => inningComplete(e)}
                            disable={!(match.currentOver == match.overs || team2Runs > team1Runs || (match.currentInning == 1 && team1Wickets == 10) || (match.currentInning == 2 && team2Wickets == 10))}
                            label="Innings Update"
                            color="#f44336"
                        />

                        <Button
                            loadingNewBatsman={loadingNewBatsman}
                            loadingUpdate={loadingUpdate}
                            loadingInnings={loadingInnings}
                            onClick={(e) => updateMatchScore(e, 0, 0, false, false, `${match.currentOver}.${match.currentBall + 1} - That's a dot delivery played by ${match.currentBatsman}.`)}
                            disable={!match.currentBatsman || !match.nonStriker || !match.currentBowler}
                            label="0"
                            color="#757575"
                        />

                        <Button
                            loadingNewBatsman={loadingNewBatsman}
                            loadingUpdate={loadingUpdate}
                            loadingInnings={loadingInnings}
                            onClick={(e) => updateMatchScore(e, 1, 0, false, false, `${match.currentOver}.${match.currentBall + 1} - A single run is taken by ${match.currentBatsman}.`)}
                            disable={!match.currentBatsman || !match.nonStriker || !match.currentBowler}
                            label="1"
                            color="#0277bd"
                        />

                        <Button
                            loadingNewBatsman={loadingNewBatsman}
                            loadingUpdate={loadingUpdate}
                            loadingInnings={loadingInnings}
                            onClick={(e) => updateMatchScore(e, 2, 0, false, false, `${match.currentOver}.${match.currentBall + 1} - ${match.currentBatsman} takes two runs.`)}
                            disable={!match.currentBatsman || !match.nonStriker || !match.currentBowler}
                            label="2"
                            color="#388e3c"
                        />

                        <Button
                            loadingNewBatsman={loadingNewBatsman}
                            loadingUpdate={loadingUpdate}
                            loadingInnings={loadingInnings}
                            onClick={(e) => updateMatchScore(e, 3, 0, false, false, `${match.currentOver}.${match.currentBall + 1} - A three runs scored by ${match.currentBatsman}.`)}
                            disable={!match.currentBatsman || !match.nonStriker || !match.currentBowler}
                            label="3"
                            color="#f44336"
                        />

                        <Button
                            loadingNewBatsman={loadingNewBatsman}
                            loadingUpdate={loadingUpdate}
                            loadingInnings={loadingInnings}
                            onClick={(e) => updateMatchScore(e, 4, 0, false, false, `${match.currentOver}.${match.currentBall + 1} - A boundary hit by ${match.currentBatsman}!`)}
                            disable={!match.currentBatsman || !match.nonStriker || !match.currentBowler}
                            label="4"
                            color="#4caf50"
                        />

                        <Button
                            loadingNewBatsman={loadingNewBatsman}
                            loadingUpdate={loadingUpdate}
                            loadingInnings={loadingInnings}
                            onClick={(e) => updateMatchScore(e, 6, 0, false, false, `${match.currentOver}.${match.currentBall + 1} - ${match.currentBatsman} hits a six!`)}
                            disable={!match.currentBatsman || !match.nonStriker || !match.currentBowler}
                            label="6"
                            color="#673ab7"
                        />

                        <Button
                            loadingNewBatsman={loadingNewBatsman}
                            loadingUpdate={loadingUpdate}
                            loadingInnings={loadingInnings}
                            onClick={(e) => updateMatchScore(e, 0, 1, false, false, `${match.currentOver}.${match.currentBall + 1} - Leg bye taken by ${match.currentBatsman}.`)}
                            disable={!match.currentBatsman || !match.nonStriker || !match.currentBowler}
                            label="1 - LegBye"
                            color="#ff9800"
                        />

                        <Button
                            loadingNewBatsman={loadingNewBatsman}
                            loadingUpdate={loadingUpdate}
                            loadingInnings={loadingInnings}
                            onClick={(e) => updateMatchScore(e, 0, 1, true, false, `${match.currentOver}.${match.currentBall + 1} - Wide ball bowled and ${match.currentBatsman} takes a run.`)}
                            disable={!match.currentBatsman || !match.nonStriker || !match.currentBowler}
                            label="Wide"
                            color="#ff9800"
                        />

                        <Button
                            loadingNewBatsman={loadingNewBatsman}
                            loadingUpdate={loadingUpdate}
                            loadingInnings={loadingInnings}
                            onClick={(e) => updateMatchScore(e, 0, 3, true, false, `${match.currentOver}.${match.currentBall + 1} - Wide ball followed by two extra runs.`)}
                            disable={!match.currentBatsman || !match.nonStriker || !match.currentBowler}
                            label="Wide + 2"
                            color="#66bb6a"
                        />

                        <Button
                            loadingNewBatsman={loadingNewBatsman}
                            loadingUpdate={loadingUpdate}
                            loadingInnings={loadingInnings}
                            onClick={(e) => updateMatchScore(e, 0, 0, false, true, `${match.currentOver}.${match.currentBall + 1} - ${match.currentBatsman} is run out. 1 run added.`)}
                            disable={!match.currentBatsman || !match.nonStriker || !match.currentBowler}
                            label="Runout"
                            color="#1976d2"
                        />

                        <Button
                            loadingNewBatsman={loadingNewBatsman}
                            loadingUpdate={loadingUpdate}
                            loadingInnings={loadingInnings}
                            onClick={(e) => updateMatchScore(e, 2, 0, false, true, `${match.currentOver}.${match.currentBall + 1} - ${match.currentBatsman} is run out. 2 runs added.`)}
                            disable={!match.currentBatsman || !match.nonStriker || !match.currentBowler}
                            label="2 + Runout"
                            color="#388e3c"
                        />

                        <Button
                            loadingNewBatsman={loadingNewBatsman}
                            loadingUpdate={loadingUpdate}
                            loadingInnings={loadingInnings}
                            onClick={(e) => updateMatchScore(e, 0, 0, false, true, `${match.currentOver}.${match.currentBall + 1} - Wicket! ${match.currentBatsman} is dismissed.`)}
                            disable={!match.currentBatsman || !match.nonStriker || !match.currentBowler}
                            label="Wicket"
                            color="#d32f2f"
                        />

                    </div>
                </>
            }

            <div className='flex flex-col mt-4 border-t-2 border-[#15171a] pt-2'>
                <div className='text-center font-bold text-lg text-[#e8e8e8]'>
                    Commentary
                </div>
                <div className='overflow-y-auto max-h-[200px] border border-[#15171a] rounded-md p-2 mt-2'>
                    {match.commentary.slice().reverse().map((comment, index) => (
                        <div key={index} className='mb-1'>
                            {comment}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const Button = ({ disable, label, color, onClick: functionToCall, loadingInnings, loadingUpdate, loadingNewBatsman }) => {
    const buttonStyle = disable
        ? {
            backgroundColor: `${color}99`,
            opacity: 0.6,
            cursor: 'not-allowed',
        }
        : {
            backgroundColor: color,
            opacity: 1,
            cursor: 'pointer',
        };

    return (
        <button
            disabled={disable || loadingInnings || loadingUpdate || loadingNewBatsman}
            style={buttonStyle}
            onClick={functionToCall}
            className='p-4 rounded-md text-white font-bold'>
            {label}
        </button>
    );
};


export default ScoreBoard;
