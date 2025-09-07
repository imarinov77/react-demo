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
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  TableSortLabel,
} from "@mui/material";

const API_URL = "https://880f0qm8f8.execute-api.eu-central-1.amazonaws.com/prod/";

export default function App() {
  const [patients, setPatients] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [form, setForm] = useState({ name: "", age: "", city: "", notes: "" });
  const [errors, setErrors] = useState({});
  const [orderBy, setOrderBy] = useState("name");
  const [order, setOrder] = useState("asc");

  const fetchPatients = async () => {
    const res = await fetch(API_URL);
    const data = await res.json();
    setPatients(data);
  };

  const openDialog = (patient = null) => {
    if (patient) {
      setEditingPatient(patient);
      setForm({ name: patient.name, age: patient.age, city: patient.city, notes: patient.notes });
    } else {
      setEditingPatient(null);
      setForm({ name: "", age: "", city: "", notes: "" });
    }
    setErrors({});
    setDialogOpen(true);
  };

  const closeDialog = () => setDialogOpen(false);

  const validate = () => {
    const errs = {};
    if (!form.name) errs.name = "Задължително поле";
    if (!form.age && form.age !== 0) errs.age = "Задължително поле";
    else if (isNaN(form.age) || form.age < 0 || form.age > 100) errs.age = "Въведете число между 0 и 100";
    if (!form.city) errs.city = "Задължително поле";
    if (!form.notes) errs.notes = "Задължително поле";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const savePatient = async () => {
    if (!validate()) return;

    if (editingPatient) {
      await fetch(API_URL, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingPatient.id }),
      });
    }

    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    await res.json();
    fetchPatients();
    closeDialog();
  };

  const deletePatient = async (id) => {
    await fetch(API_URL, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    fetchPatients();
  };

  const handleSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
    const sorted = [...patients].sort((a, b) => {
      if (a[property] < b[property]) return isAsc ? -1 : 1;
      if (a[property] > b[property]) return isAsc ? 1 : -1;
      return 0;
    });
    setPatients(sorted);
  };

  useEffect(() => { fetchPatients(); }, []);

  return (
    <Container maxWidth="md" style={{ marginTop: "30px", backgroundColor: "#f5f5f5", padding: "20px", borderRadius: "10px" }}>
      <Typography variant="h4" gutterBottom align="center">
        Списък с пациенти
      </Typography>

      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <Button variant="contained" color="primary" onClick={() => openDialog()}>
          Добави нов пациент
        </Button>
      </div>

      <Paper elevation={3} style={{ overflowX: "auto" }}>
        <Table style={{ minWidth: "600px", margin: "auto" }}>
          <TableHead>
            <TableRow>
              {["name", "age", "city", "notes"].map((col) => (
                <TableCell key={col}>
                  <TableSortLabel
                    active={orderBy === col}
                    direction={orderBy === col ? order : "asc"}
                    onClick={() => handleSort(col)}
                  >
                    {col === "name" ? "Име" : col === "age" ? "Години" : col === "city" ? "Град" : "Забележки"}
                  </TableSortLabel>
                </TableCell>
              ))}
              <TableCell>Действие</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {patients.map((p) => (
              <TableRow key={p.id}>
                <TableCell>{p.name}</TableCell>
                <TableCell>{p.age}</TableCell>
                <TableCell>{p.city}</TableCell>
                <TableCell>{p.notes}</TableCell>
                <TableCell style={{ display: "flex", gap: "5px" }}>
                  <Button variant="outlined" color="primary" onClick={() => openDialog(p)}>Edit</Button>
                  <Button variant="outlined" color="error" onClick={() => deletePatient(p.id)}>Delete</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      <Dialog open={dialogOpen} onClose={closeDialog}>
        <DialogTitle>{editingPatient ? "Редактирай пациент" : "Добави пациент"}</DialogTitle>
        <DialogContent style={{ display: "flex", flexDirection: "column", gap: "15px", minWidth: "300px" }}>
          <TextField
            label="Име"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            error={!!errors.name}
            helperText={errors.name}
          />
          <TextField
            label="Години"
            type="number"
            inputProps={{ step: "0.1", min: 0, max: 100 }}
            value={form.age}
            onChange={(e) => setForm({ ...form, age: parseFloat(e.target.value) })}
            error={!!errors.age}
            helperText={errors.age}
          />
          <TextField
            label="Град"
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
            error={!!errors.city}
            helperText={errors.city}
          />
          <TextField
            label="Забележки"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            error={!!errors.notes}
            helperText={errors.notes}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>Отказ</Button>
          <Button onClick={savePatient} variant="contained" color="primary">
            Запази
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
