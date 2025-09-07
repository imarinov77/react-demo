import { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
} from "@mui/material";

const API_URL = "https://880f0qm8f8.execute-api.eu-central-1.amazonaws.com/prod/";

function App() {
  const [patients, setPatients] = useState([]);
  const [form, setForm] = useState({ name: "", age: "", city: "", notes: "" });

  const fetchPatients = async () => {
    const res = await fetch(API_URL);
    const data = await res.json();
    setPatients(data);
  };

  const addPatient = async () => {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setPatients([...patients, data]);
    setForm({ name: "", age: "", city: "", notes: "" });
  };

  const deletePatient = async (id) => {
    await fetch(API_URL, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setPatients(patients.filter(p => p.id !== id));
  };

  useEffect(() => { fetchPatients(); }, []);

  return (
    <Container>
      <Typography variant="h3" gutterBottom>Пациенти</Typography>

      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <TextField label="Име" value={form.name} onChange={e => setForm({...form, name:e.target.value})} />
        <TextField label="Години" value={form.age} onChange={e => setForm({...form, age:e.target.value})} />
        <TextField label="Град" value={form.city} onChange={e => setForm({...form, city:e.target.value})} />
        <TextField label="Забележки" value={form.notes} onChange={e => setForm({...form, notes:e.target.value})} />
        <Button variant="contained" color="primary" onClick={addPatient}>Добави</Button>
      </div>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Име</TableCell>
            <TableCell>Години</TableCell>
            <TableCell>Град</TableCell>
            <TableCell>Забележки</TableCell>
            <TableCell>Действие</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {patients.map(p => (
            <TableRow key={p.id}>
              <TableCell>{p.name}</TableCell>
              <TableCell>{p.age}</TableCell>
              <TableCell>{p.city}</TableCell>
              <TableCell>{p.notes}</TableCell>
              <TableCell>
                <Button variant="outlined" color="error" onClick={() => deletePatient(p.id)}>Изтрий</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Container>
  );
}

export default App;
