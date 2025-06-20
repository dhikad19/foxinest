import React from "react";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
} from "@mui/material";
import {
  CheckCircleOutline,
  DesignServices,
  Devices,
} from "@mui/icons-material";
const AboutPage = () => {
  return (
    <Container
      style={{ maxWidth: 700, paddingTop: "60px" }}
      sx={{ mt: 2, mb: 6 }}
    >
      <Box sx={{ mb: 3 }}>
        <h2 style={{ marginBottom: "0px", marginTop: "-5px" }}>About</h2>
      </Box>

      <div>
        <p style={{ fontSize: 15 }}>
          Welcome to{" "}
          <strong>
            <span style={{ color: "#ff7800" }}>Foxinest</span>
          </strong>
          !
        </p>
        <p style={{ fontSize: 15 }}>
          Foxinest App is a simple yet powerful task management application
          designed to help you stay organized and boost your productivity.
          Created by Dika as part of a personal portfolio project, this app
          demonstrates the seamless integration of modern web technologies and
          user-centric design. Please note: This application is still in
          development and currently uses local storage. As a result, the data
          stored is only local and temporary.
        </p>
      </div>

      <Box sx={{ my: 6 }}>
        <p style={{ marginBottom: "10px", fontSize: 18, fontWeight: 500 }}>
          Key Features
        </p>
        <Box
          sx={{
            display: "grid",
            gap: 2,
            gridTemplateColumns: {
              xs: "repeat(auto-fit, minmax(300px, 1fr))",
              lg: "repeat(3, 1fr)",
            },
            justifyContent: "center",
          }}
        >
          {[
            {
              icon: (
                <CheckCircleOutline
                  style={{ color: "#ff7800" }}
                  fontSize="large"
                />
              ),
              title: "Effortless Task Management",
              text: "Add, edit, and delete tasks with ease.",
            },
            {
              icon: (
                <DesignServices style={{ color: "#ff7800" }} fontSize="large" />
              ),
              title: "Intuitive Design",
              text: "A clean and straightforward interface for a smooth user experience.",
            },
            {
              icon: <Devices style={{ color: "#ff7800" }} fontSize="large" />,
              title: "Cross-Platform Compatibility",
              text: "Works beautifully on desktop and mobile devices.",
            },
          ].map((feature, idx) => (
            <Card
              key={idx}
              variant="outlined"
              sx={{
                p: 2,
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
                "&:hover": {
                  transform: "scale(1.05)",
                },
                cursor: "pointer",
              }}
            >
              {feature.icon}
              <p
                style={{
                  fontWeight: 500,
                  lineHeight: "normal",
                  marginTop: "15px",
                }}
              >
                {feature.title}
              </p>
              <Typography
                variant="body1"
                style={{ fontSize: 14 }}
                sx={{ mt: 1, wordBreak: "break-word", whiteSpace: "normal" }}
              >
                {feature.text}
              </Typography>
            </Card>
          ))}
        </Box>
      </Box>

      <Box sx={{ my: 6 }}>
        <p style={{ marginBottom: "10px", fontSize: 18, fontWeight: 500 }}>
          Author and Goals
        </p>
        <div>
          <p style={{ fontSize: 15 }}>
            Hi, I’m Dika! I am a passionate web developer with a keen interest
            in crafting intuitive and functional applications. Foxinest App is
            one of my personal projects, showcasing my skills in React and web
            development. It reflects my dedication to delivering high-quality
            user experiences. The primary goal of Foxinest App is to serve as a
            portfolio piece that highlights my technical skills and creativity
            in solving everyday problems through code. It’s also a tool I’ve
            personally enjoyed using to organize my day-to-day tasks.
          </p>
        </div>
      </Box>
    </Container>
  );
};

export default AboutPage;
