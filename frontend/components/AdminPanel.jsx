import React, { useEffect, useState } from 'react'
import SetupBoard from './SetupBoard';
import useGetMatch from '@/hooks/useGetMatch';
import ScoreBoard from './ScoreBoard';
import { io } from 'socket.io-client';

const AdminPanel = () => {
    const [match, setMatch] = useState(null);
    useEffect(() => {
        // Connect to the socket server
        const socket = io('http://localhost:8000'); // Make sure this matches your server URL

        // Listen for the 'match_updated' event
        socket.on('match_updated', (updatedMatch) => {
            setMatch(updatedMatch); // Update the state with the new match data
        });

        // Cleanup on component unmount
        return () => {
            socket.off('match_updated'); // Remove the event listener
            socket.disconnect(); // Disconnect the socket
        };
    }, []);

    const { loading, getMatch } = useGetMatch();
    useEffect(() => {
        async function getData() {
            const data = await getMatch();
            if (data?.success) setMatch(data?.match);
        }
        getData();
    }, [])

    return (
        <div className='flex justify-center items-center min-w-screen min-h-screen'>
            {!match && <SetupBoard setMatch={setMatch} />}
            {match && <ScoreBoard match={match} setMatch={setMatch} />}
        </div>
    )
}

export default AdminPanel