import { useEffect, useState } from "react";
import { Container, Typography, Button } from "@mui/material";

function App() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("https://8i6xcgvir3.execute-api.eu-central-1.amazonaws.com/prod/")
      .then(res => res.json())
      .then(data => setMessage(data.message));
  }, []);

  return (
    <Container>
      <Typography variant="h3" gutterBottom>
        React + MUI + AWS CDK
      </Typography>
      <Typography>{message}</Typography>
      <Button variant="contained" color="primary">
        Кликни ме
      </Button>
    </Container>
  );
}

export default App;
