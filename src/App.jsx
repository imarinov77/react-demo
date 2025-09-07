import { useState } from "react";
import { Container, Typography, Button } from "@mui/material";

function App() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      const res = await fetch("https://8i6xcgvir3.execute-api.eu-central-1.amazonaws.com/prod/");
      const data = await res.json();
      setMessage(data.message); // очакваме {"message": "..."}
    } catch (err) {
      setMessage("Грешка при свързване с API");
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <Container>
      <Typography variant="h3" gutterBottom>
        React + MUI + AWS CDK
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={handleClick}
        disabled={loading}
      >
        {loading ? "Зареждане..." : "Кликни ме"}
      </Button>
      <Typography style={{ marginTop: "20px", fontSize: "18px" }}>
        {message}
      </Typography>
    </Container>
  );
}

export default App;
