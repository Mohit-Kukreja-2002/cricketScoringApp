import useMatchInit from '@/hooks/match/useMatchInit';
import React, { useState } from 'react';
import toast from 'react-hot-toast';

const SetupBoard = ({setMatch}) => {
    const [team1Name, setTeam1Name] = useState("");
    const [team2Name, setTeam2Name] = useState("");
    const [team1Players, setTeam1Players] = useState(
        Array(11).fill({ name: "" })
    );
    const [team2Players, setTeam2Players] = useState(
        Array(11).fill({ name: "" })
    );
    const [overs, setOvers] = useState("");
    const [battingFirst, setBattingFirst] = useState("");

    const handleTeam1PlayerChange = (index, value) => {
        const updatedPlayers = [...team1Players];
        updatedPlayers[index] = { ...updatedPlayers[index], name: value };
        setTeam1Players(updatedPlayers);
    };

    const handleTeam2PlayerChange = (index, value) => {
        const updatedPlayers = [...team2Players];
        updatedPlayers[index] = { ...updatedPlayers[index], name: value };
        setTeam2Players(updatedPlayers);
    };

    const {loading, matchInit} = useMatchInit();

    async function handleSubmit(e){
        e.preventDefault();
        if (!team1Name || !team2Name) {
            toast.error("Please enter both team names.");
            return;
        }
        if (team1Players.some(player => !player.name)) {
            toast.error("Please fill all Team 1 players' names.");
            return;
        }
        if (team2Players.some(player => !player.name)) {
            toast.error("Please fill all Team 2 players' names.");
            return;
        }
        if (!battingFirst) {
            toast.error("Please select the team batting first.");
            return;
        }
        if (overs <= 0) {
            toast.error("Overs should be greater than 0.");
            return;
        }

        // Final match setup data
        const matchDetails = {
            team1 : team1Name,
            team2 : team2Name,
            team1Players,
            team2Players,
            overs,
            battingFirst: battingFirst === "team1" ? team1Name : team2Name,
        };

        console.log(matchDetails)
        const data = await matchInit(matchDetails);
        console.log(data)
        if(data?.success){
            setMatch(data?.match);
        }
        if(data?.success == false){
            toast.error(data?.message || data?.error);
        }
    };

    return (
        <div className="bg-[#202124] text-[#bdc1c6] p-8 rounded w-[800px] mx-auto">
            <h1 className="text-2xl font-bold mb-6 text-center text-[#e8e8e8]">
                Cricket Match Setup Panel
            </h1>

            <div className="flex justify-between mb-6">
                <div className="flex-1 mr-4">
                    <label className="block mb-2">Team 1 Name</label>
                    <input
                        type="text"
                        value={team1Name}
                        onChange={(e) => setTeam1Name(e.target.value)}
                        className="w-full p-2 rounded bg-[#303134] border border-[#3c4043] focus:outline-none"
                        placeholder="Enter Team 1 Name"
                    />
                </div>
                <div className="flex-1 ml-4">
                    <label className="block mb-2">Team 2 Name</label>
                    <input
                        type="text"
                        value={team2Name}
                        onChange={(e) => setTeam2Name(e.target.value)}
                        className="w-full p-2 rounded bg-[#303134] border border-[#3c4043] focus:outline-none"
                        placeholder="Enter Team 2 Name"
                    />
                </div>
            </div>

            <div className="flex gap-8">
                <div className="flex-1">
                    <h3 className="font-bold mb-2">Team 1 Players</h3>
                    {team1Players.map((player, index) => (
                        <input
                            key={index}
                            type="text"
                            value={player.name}
                            onChange={(e) => handleTeam1PlayerChange(index, e.target.value)}
                            className="w-full p-1 mb-2 rounded bg-[#303134] border border-[#3c4043] focus:outline-none"
                            placeholder={`Player ${index + 1}`}
                        />
                    ))}
                </div>
                <div className="flex-1">
                    <h3 className="font-bold mb-2">Team 2 Players</h3>
                    {team2Players.map((player, index) => (
                        <input
                            key={index}
                            type="text"
                            value={player.name}
                            onChange={(e) => handleTeam2PlayerChange(index, e.target.value)}
                            className="w-full p-1 mb-2 rounded bg-[#303134] border border-[#3c4043] focus:outline-none"
                            placeholder={`Player ${index + 1}`}
                        />
                    ))}
                </div>
            </div>

            <div className="mt-6">
                <div className="mb-6">
                    <label className="block mb-2">Number of Overs</label>
                    <input
                        type="number"
                        value={overs}
                        onChange={(e) => setOvers(e.target.value)}
                        className="w-full p-2 rounded bg-[#303134] border border-[#3c4043] focus:outline-none"
                        placeholder="Enter Number of Overs"
                        min="1"
                    />
                </div>
                <div>
                    <label className="block mb-2">Batting First</label>
                    <select
                        value={battingFirst}
                        onChange={(e) => setBattingFirst(e.target.value)}
                        className="w-full p-2 rounded bg-[#303134] border border-[#3c4043] focus:outline-none"
                    >
                        <option value="">Select Team</option>
                        <option value="team1">{team1Name || "Team 1"}</option>
                        <option value="team2">{team2Name || "Team 2"}</option>
                    </select>
                </div>
            </div>

            <button
                onClick={handleSubmit}
                disabled={loading}
                className="mt-6 w-full p-2 bg-[#1a73e8] text-white rounded hover:bg-[#155ab6] transition"
            >
                {loading ? "Initialising the match" : "Submit Match Setup"}
            </button>
        </div>
    );
};

export default SetupBoard;
