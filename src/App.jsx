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

// aws-amplify 6.x импорти
import { fetchAuthSession } from "@aws-amplify/auth";
import awsconfig from "./aws-exports";
import { withAuthenticator } from "@aws-amplify/ui-react";

const API_NAME = "PatientsAPI";
const API_PATH = "/"; // пътят трябва да започва с '/'
// Намира endpoint от няколко възможни места в конфигурацията
const API_ENDPOINT = (() => {
  const rest = (awsconfig?.API?.REST?.endpoints) || [];
  const root = (awsconfig?.API?.endpoints) || [];
  const all = [...rest, ...root];
  const byName = all.find((e) => e?.name === API_NAME)?.endpoint;
  return byName || rest[0]?.endpoint || root[0]?.endpoint || "";
})();

function App({ signOut, user }) {
  const [patients, setPatients] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [form, setForm] = useState({ name: "", age: "", city: "", notes: "" });
  const [errors, setErrors] = useState({});
  const [orderBy, setOrderBy] = useState("name");
  const [order, setOrder] = useState("asc");
  const [isAdmin, setIsAdmin] = useState(
    !!(user && user.signInUserSession?.idToken?.payload?.["cognito:groups"]?.includes("admin"))
  );

  const getAuthToken = async () => {
    const session = await fetchAuthSession();
    // Use ID token for API Gateway Cognito authorizer
    const idToken = session.tokens?.idToken?.toString();
    return idToken || "";
  };

  const doRequest = async (method, body, pathSuffix = "") => {
    const token = await getAuthToken();
    const resp = await fetch(`${API_ENDPOINT}${API_PATH}${pathSuffix}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!resp.ok) {
      const text = await resp.text().catch(() => "");
      throw new Error(`HTTP ${resp.status} ${text}`);
    }
    return resp.json().catch(() => ({}));
  };

  const fetchPatients = async () => {
    if (!API_ENDPOINT) {
      // eslint-disable-next-line no-console
      console.error("AWS Amplify API endpoint is missing in aws-exports.js");
      throw new Error("Missing API endpoint configuration");
    }
    const data = await doRequest('GET');
    // Backend returns either array or { user, groups, patients }
    const list = Array.isArray(data) ? data : (data.patients || []);
    setPatients(list);
    if (data && Array.isArray(data.groups)) {
      setIsAdmin(data.groups.includes("admin"));
    }
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
    if (form.age === "" || form.age === null || isNaN(form.age) || form.age < 0 || form.age > 100)
      errs.age = "Въведете число между 0 и 100";
    if (!form.city) errs.city = "Задължително поле";
    if (!form.notes) errs.notes = "Задължително поле";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const savePatient = async () => {
    if (!validate()) return;
    if (editingPatient) {
      await doRequest('DELETE', { id: editingPatient.id });
    }

    await doRequest('POST', form);

    fetchPatients();
    closeDialog();
  };

  const deletePatient = async (id) => {
    if (!isAdmin) return;
    await doRequest('DELETE', { id });
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

  useEffect(() => {
    // initialize admin from user object as a fallback
    const initialAdmin = !!(user && user.signInUserSession?.idToken?.payload?.["cognito:groups"]?.includes("admin"));
    setIsAdmin(initialAdmin);
    fetchPatients();
  }, []);

  return (
    <Container
      maxWidth="md"
      style={{
        marginTop: "30px",
        backgroundColor: "#f0f4f8",
        padding: "20px",
        borderRadius: "10px",
      }}
    >
      <Typography variant="h4" gutterBottom align="center">
        Списък с пациенти
      </Typography>

      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        {isAdmin && (
          <Button variant="contained" color="primary" onClick={() => openDialog()}>
            Добави нов пациент
          </Button>
        )}
        <Button
          variant="outlined"
          color="secondary"
          style={{ marginLeft: "10px" }}
          onClick={signOut}
        >
          Logout
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
                    {col === "name"
                      ? "Име"
                      : col === "age"
                      ? "Години"
                      : col === "city"
                      ? "Град"
                      : "Забележки"}
                  </TableSortLabel>
                </TableCell>
              ))}
              {isAdmin && <TableCell>Действие</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {patients.map((p) => (
              <TableRow key={p.id}>
                <TableCell>{p.name}</TableCell>
                <TableCell>{p.age}</TableCell>
                <TableCell>{p.city}</TableCell>
                <TableCell>{p.notes}</TableCell>
                {isAdmin && (
                  <TableCell style={{ display: "flex", gap: "5px" }}>
                    <Button variant="outlined" color="primary" onClick={() => openDialog(p)}>
                      Edit
                    </Button>
                    <Button variant="outlined" color="error" onClick={() => deletePatient(p.id)}>
                      Delete
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      <Dialog open={dialogOpen} onClose={closeDialog}>
        <DialogTitle>{editingPatient ? "Редактирай пациент" : "Добави пациент"}</DialogTitle>
        <DialogContent
          style={{ display: "flex", flexDirection: "column", gap: "15px", minWidth: "300px" }}
        >
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

export default withAuthenticator(App);
