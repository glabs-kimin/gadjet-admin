// Dashboard.jsx (예약 통계 포함)
import React, { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
  ResponsiveContainer,
} from "recharts";

export default function Dashboard() {
  const [spaceName, setSpaceName] = useState("");
  const [spaces, setSpaces] = useState([]);
  const [selectedSpace, setSelectedSpace] = useState("");
  const [reservationDate, setReservationDate] = useState("");
  const [reservationTime, setReservationTime] = useState("");
  const [reservationEmail, setReservationEmail] = useState("");
  const [reservations, setReservations] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editedReservation, setEditedReservation] = useState({});
  const [spaceStats, setSpaceStats] = useState([]);
  const [dateStats, setDateStats] = useState([]);

  const handleAddSpace = async () => {
    if (!spaceName) return;
    await addDoc(collection(db, "spaces"), {
      name: spaceName,
      createdAt: serverTimestamp(),
    });
    setSpaceName("");
    loadSpaces();
  };

  const loadSpaces = async () => {
    const snapshot = await getDocs(collection(db, "spaces"));
    const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setSpaces(list);
  };

  const handleAddReservation = async () => {
    if (!selectedSpace || !reservationDate || !reservationTime || !reservationEmail) return;
    await addDoc(collection(db, "reservations"), {
      spaceId: selectedSpace,
      date: reservationDate,
      time: reservationTime,
      userEmail: reservationEmail,
      createdAt: serverTimestamp(),
    });
    setReservationDate("");
    setReservationTime("");
    setReservationEmail("");
    loadReservations();
  };

  const loadReservations = async () => {
    const snapshot = await getDocs(collection(db, "reservations"));
    const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setReservations(list);
    generateStats(list);
  };

  const handleEdit = (res) => {
    setEditingId(res.id);
    setEditedReservation({ ...res });
  };

  const handleUpdate = async () => {
    const ref = doc(db, "reservations", editingId);
    await updateDoc(ref, {
      date: editedReservation.date,
      time: editedReservation.time,
      userEmail: editedReservation.userEmail,
    });
    setEditingId(null);
    loadReservations();
  };

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, "reservations", id));
    loadReservations();
  };

  const generateStats = (list) => {
    const spaceMap = {};
    const dateMap = {};

    list.forEach((r) => {
      spaceMap[r.spaceId] = (spaceMap[r.spaceId] || 0) + 1;
      dateMap[r.date] = (dateMap[r.date] || 0) + 1;
    });

    setSpaceStats(Object.entries(spaceMap).map(([name, count]) => ({ name, count })));
    setDateStats(Object.entries(dateMap).map(([date, count]) => ({ date, count })));
  };

  useEffect(() => {
    loadSpaces();
    loadReservations();
  }, []);

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">운영 대시보드</h1>

      <div className="mb-6 flex items-center gap-2">
        <input
          value={spaceName}
          onChange={(e) => setSpaceName(e.target.value)}
          placeholder="공간 이름"
          className="border p-2"
        />
        <button onClick={handleAddSpace} className="bg-green-500 text-white p-2 rounded">
          추가
        </button>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4">
        <select
          value={selectedSpace}
          onChange={(e) => setSelectedSpace(e.target.value)}
          className="border p-2"
        >
          <option value="">공간 선택</option>
          {spaces.map((s) => (
            <option key={s.id} value={s.name}>
              {s.name}
            </option>
          ))}
        </select>

        <input
          type="email"
          placeholder="이메일"
          value={reservationEmail}
          onChange={(e) => setReservationEmail(e.target.value)}
          className="border p-2"
        />
        <input
          type="date"
          value={reservationDate}
          onChange={(e) => setReservationDate(e.target.value)}
          className="border p-2"
        />
        <input
          type="time"
          value={reservationTime}
          onChange={(e) => setReservationTime(e.target.value)}
          className="border p-2"
        />
        <button
          onClick={handleAddReservation}
          className="bg-blue-500 text-white p-2 col-span-2 rounded"
        >
          예약 추가
        </button>
      </div>

      <div className="bg-white p-4 shadow rounded mb-6">
        <h2 className="text-xl font-semibold mb-2">예약 내역</h2>
        <ul>
          {reservations.map((r) => (
            <li key={r.id} className="mb-2 text-sm flex gap-2 items-center">
              {editingId === r.id ? (
                <>
                  <input
                    type="date"
                    value={editedReservation.date}
                    onChange={(e) =>
                      setEditedReservation({ ...editedReservation, date: e.target.value })
                    }
                    className="border p-1"
                  />
                  <input
                    type="time"
                    value={editedReservation.time}
                    onChange={(e) =>
                      setEditedReservation({ ...editedReservation, time: e.target.value })
                    }
                    className="border p-1"
                  />
                  <input
                    type="email"
                    value={editedReservation.userEmail}
                    onChange={(e) =>
                      setEditedReservation({ ...editedReservation, userEmail: e.target.value })
                    }
                    className="border p-1"
                  />
                  <button
                    onClick={handleUpdate}
                    className="bg-green-500 text-white p-1 rounded"
                  >
                    저장
                  </button>
                </>
              ) : (
                <>
                  📌 {r.date} {r.time} / {r.spaceId} / {r.userEmail}
                  <button
                    onClick={() => handleEdit(r)}
                    className="bg-yellow-400 text-white p-1 rounded ml-2"
                  >
                    수정
                  </button>
                  <button
                    onClick={() => handleDelete(r.id)}
                    className="bg-red-500 text-white p-1 rounded ml-1"
                  >
                    삭제
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-white p-4 shadow rounded">
        <h2 className="text-xl font-semibold mb-2">📊 예약 통계</h2>
        <div className="h-64 mb-8">
          <h3 className="text-md font-semibold mb-1">공간별 예약 수</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={spaceStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="h-64">
          <h3 className="text-md font-semibold mb-1">날짜별 예약 수</h3>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dateStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#82ca9d" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}