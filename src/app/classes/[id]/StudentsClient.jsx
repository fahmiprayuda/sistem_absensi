"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function StudentsClient({ students, classData }) {
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const studentsPerPage = 10;

  const selectedStatus = selected ? getStatus(selected) : null;
  const isEdit = selectedStatus && selectedStatus !== "present";
  const canEdit = canEditAttendance();

  const filteredStudents = students.filter((student) =>
    student.name.toLowerCase().includes(search.trim().toLowerCase()),
  );

  const absentStudents = filteredStudents.filter(
    (student) => getStatus(student) !== "present",
  );

  const presentStudents = filteredStudents.filter(
    (student) => getStatus(student) === "present",
  );

  const startIndex = (page - 1) * studentsPerPage;
  const endIndex = startIndex + studentsPerPage;

  const paginatedPresentStudents = presentStudents.slice(startIndex, endIndex);
  const totalPages = Math.ceil(presentStudents.length / studentsPerPage);

  async function setPresent() {
    const today = new Date().toISOString().split("T")[0];

    const { error } = await supabase
      .from("attendance")
      .delete()
      .eq("student_id", selected.id)
      .eq("date", today);

    if (error) {
      alert(error.message);
    } else {
      setSelected(null);
      window.location.reload();
    }
  }

  async function saveAttendance(status) {
    if (!canEditAttendance()) {
      alert(
        "Absensi hanya bisa diedit sampai jam 15:00, Silakan hubungi admin untuk perubahan setelah jam tersebut.",
      );
      return;
    }

    const today = new Date().toISOString().split("T")[0];

    const { error } = await supabase.from("attendance").upsert(
      {
        student_id: selected.id,
        date: today,
        status: status,
        teacher_id: null,
      },
      {
        onConflict: "student_id,date",
      },
    );

    if (error) {
      alert(error.message);
    } else {
      setSelected(null);
      window.location.reload();
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">
        Daftar Siswa Kelas {classData.name}
      </h1>

      {/* SEARCH */}
      <div className="relative mb-4">
        <input
          type="text"
          placeholder="Cari siswa..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="w-full p-3 pl-10 pr-10 border rounded-lg focus:outline-none focus:ring focus:ring-blue-200"
        />

        <span className="absolute left-3 top-3 text-gray-400">🔍</span>

        {search && (
          <button
            onClick={() => {
              setSearch("");
              setPage(1);
            }}
            className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        )}
      </div>

      {/* SISWA TIDAK HADIR */}
      {absentStudents.length > 0 && (
        <>
          <h2 className="text-sm font-semibold text-red-600 mb-2">
            Siswa Tidak Hadir ({absentStudents.length})
          </h2>

          <div className="space-y-2 mb-6">
            {absentStudents.map((student) => {
              const status = getStatus(student);

              return (
                <div
                  key={student.id}
                  onClick={() => setSelected(student)}
                  className="p-4 border rounded-lg flex justify-between cursor-pointer bg-red-50 border-red-200"
                >
                  <span>{student.name}</span>

                  <span className="text-sm font-semibold text-red-600">
                    {status === "sick" && "Sakit"}
                    {status === "permit" && "Izin"}
                    {status === "alpha" && "Alpha"}
                  </span>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* SISWA HADIR */}
      <h2 className="text-sm font-semibold text-green-600 mb-2">
        Siswa Hadir ({presentStudents.length})
      </h2>

      <div className="overflow-x-auto border rounded-lg">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left w-16">No</th>
              <th className="p-3 text-left">Nama Siswa</th>
              <th className="p-3 text-center w-32">Status</th>
              <th className="p-3 text-center w-32">Aksi</th>
            </tr>
          </thead>

          <tbody>
            {paginatedPresentStudents.map((student, index) => {
              const number = startIndex + index + 1;

              return (
                <tr key={student.id} className="border-t hover:bg-gray-50">
                  <td className="p-3">{number}</td>

                  <td className="p-3 font-medium">{student.name}</td>

                  <td className="p-3 text-center text-green-600 font-semibold">
                    Hadir
                  </td>

                  <td className="p-3 text-center">
                    <button
                      onClick={() => setSelected(student)}
                      className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Pilih
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="mt-6 flex flex-col items-center gap-2">
          <div className="flex items-center gap-1">
            {/* Previous */}
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              className="px-3 py-1 rounded border hover:bg-gray-100 disabled:opacity-40 transition hover:scale-105 active:scale-95"
              disabled={page === 1}
            >
              ‹
            </button>

            {/* Page numbers */}
            {[...Array(totalPages)].map((_, i) => {
              const pageNumber = i + 1;

              return (
                <button
                  key={i}
                  onClick={() => setPage(pageNumber)}
                  className={`px-3 py-1 rounded border text-sm
              ${
                page === pageNumber
                  ? "bg-blue-500 text-white border-blue-500"
                  : "hover:bg-gray-100"
              }
            `}
                >
                  {pageNumber}
                </button>
              );
            })}

            {/* Next */}
            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              className="px-3 py-1 rounded border hover:bg-gray-100 disabled:opacity-40"
              disabled={page === totalPages}
            >
              ›
            </button>
          </div>

          <p className="text-xs text-gray-500">
            Halaman {page} dari {totalPages}
          </p>
        </div>
      )}

      {/* MODAL */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white w-80 rounded-xl p-6 space-y-5 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-center text-lg font-semibold">Absensi Siswa</h2>

            <p className="text-center text-gray-700 font-medium">
              {selected.name}
            </p>

            <div className="space-y-3">
              {selectedStatus !== "sick" && (
                <button
                  onClick={() => saveAttendance("sick")}
                  className="w-full py-3 rounded-lg bg-yellow-500 text-white font-semibold hover:bg-yellow-600"
                >
                  Sakit
                </button>
              )}

              {selectedStatus !== "permit" && (
                <button
                  onClick={() => saveAttendance("permit")}
                  className="w-full py-3 rounded-lg bg-blue-500 text-white font-semibold hover:bg-blue-600"
                >
                  Izin
                </button>
              )}

              {selectedStatus !== "alpha" && (
                <button
                  onClick={() => saveAttendance("alpha")}
                  className="w-full py-3 rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600"
                >
                  Alpha
                </button>
              )}

              {isEdit && (
                <button
                  onClick={setPresent}
                  className="w-full py-3 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700"
                >
                  Hadir
                </button>
              )}

              <div
                className={`text-xs p-2 rounded text-center ${
                  canEdit
                    ? "bg-orange-50 text-orange-600"
                    : "bg-red-50 text-red-600"
                }`}
              >
                {canEdit
                  ? "⚠ Edit absensi hanya sampai jam 15:00"
                  : "⛔ Waktu edit absensi sudah berakhir"}
              </div>
            </div>

            <button
              onClick={() => setSelected(null)}
              className="text-sm text-gray-500 w-full"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function getStatus(student) {
  if (!student.attendance || student.attendance.length === 0) {
    return "present";
  }

  return student.attendance[0].status;
}

function canEditAttendance() {
  const now = new Date();
  const hour = now.getHours();
  return hour < 15;
}
