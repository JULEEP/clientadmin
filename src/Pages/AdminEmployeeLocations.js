import { useEffect, useState } from "react";

export default function AdminEmployeeLocations() {
  const [employees, setEmployees] = useState([]);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ name: "", latitude: "", longitude: "" });
  const [message, setMessage] = useState("");

  const BASE_URL = "https://api.timelyhealth.in/api/employees";

  // ✅ Fetch all employees
  const fetchEmployees = async () => {
    try {
      const res = await fetch(`${BASE_URL}/all`);
      const data = await res.json();
      setEmployees(data.employees);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // ✅ Assign location to an employee
  const handleAssign = async (id) => {
    if (!form.name || !form.latitude || !form.longitude)
      return alert("Please fill all location fields");

    try {
      const res = await fetch(`${BASE_URL}/assign-location/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      setMessage(data.message);
      setForm({ name: "", latitude: "", longitude: "" });
      setSelected(null);
      fetchEmployees();
    } catch (err) {
      setMessage("Error assigning location");
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h2 className="text-2xl font-semibold mb-6 text-center">
        🧭 Employee Location Management
      </h2>

      {message && (
        <div className="bg-green-100 text-green-800 p-2 mb-4 text-center rounded">
          {message}
        </div>
      )}

      <div className="overflow-x-auto bg-white rounded-xl shadow-md p-4">
        <table className="min-w-full border border-gray-200">
          <thead className="bg-gray-200 text-gray-700">
            <tr>
              <th className="py-2 px-4 border">Employee ID</th>
              <th className="py-2 px-4 border">Name</th>
              <th className="py-2 px-4 border">Email</th>
              <th className="py-2 px-4 border">Assigned Location</th>
              <th className="py-2 px-4 border">Action</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => (
              <tr key={emp.employeeId} className="text-center">
                <td className="py-2 px-4 border">{emp.employeeId}</td>
                <td className="py-2 px-4 border">{emp.name}</td>
                <td className="py-2 px-4 border">{emp.email}</td>
                <td className="py-2 px-4 border">
                  {emp.assignedLocation ? (
                    <>
                      <p>{emp.assignedLocation.name}</p>
                      <p className="text-sm text-gray-500">
                        ({emp.assignedLocation.latitude},{" "}
                        {emp.assignedLocation.longitude})
                      </p>
                    </>
                  ) : (
                    <span className="text-gray-400">No location</span>
                  )}
                </td>
                <td className="py-2 px-4 border">
                  <button
                    onClick={() => setSelected(emp.employeeId)}
                    className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                  >
                    Assign / Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="mt-6 p-4 bg-white rounded-xl shadow-md">
          <h3 className="text-lg font-semibold mb-2">
            Assign Location for Employee ID: {selected}
          </h3>

          <div className="flex flex-col gap-2">
            <input
              type="text"
              placeholder="Location Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="border p-2 rounded"
            />
            <input
              type="number"
              placeholder="Latitude"
              value={form.latitude}
              onChange={(e) => setForm({ ...form, latitude: e.target.value })}
              className="border p-2 rounded"
            />
            <input
              type="number"
              placeholder="Longitude"
              value={form.longitude}
              onChange={(e) => setForm({ ...form, longitude: e.target.value })}
              className="border p-2 rounded"
            />

            <div className="flex gap-2">
              <button
                onClick={() => handleAssign(selected)}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Save
              </button>
              <button
                onClick={() => setSelected(null)}
                className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
