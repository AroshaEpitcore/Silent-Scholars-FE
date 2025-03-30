import React, { useEffect, useState } from "react";
import { db } from '../../../firebase'; // Import Firestore
import { collection, getDocs } from 'firebase/firestore'; // Firestore functions
import { Table } from 'antd';

export default function LeaderBoard() {
  const [leaderboardData, setLeaderboardData] = useState([]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      const leaderboardCollection = collection(db, 'users'); // Adjust the collection name if needed
      const leaderboardSnapshot = await getDocs(leaderboardCollection);
      const leaderboardList = leaderboardSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      console.log(leaderboardList);
      
      setLeaderboardData(leaderboardList);
    };

    fetchLeaderboard();
  }, []);

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Score',
      dataIndex: 'score',
      key: 'score',
      sorter: (a, b) => a.score - b.score, // Enable sorting for score
    },
  ];

  return (
    <div className="container">
      <h1 className="text-center mt-5 display-3 fw-bold">LeaderBoard</h1>
      <hr className="mx-auto mb-5 mt-5 w-25" />
      <div className="row mb-5 mx-5">
        <div className="col-md-8 m-auto">
          <Table 
            columns={columns} 
            dataSource={leaderboardData} 
            rowKey="id" 
            pagination={false} // Disable pagination if not needed
            bordered
          />
        </div>
      </div>
    </div>
  );
}
