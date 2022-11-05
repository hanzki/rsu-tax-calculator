import React from 'react';
import './App.css';
import { Container } from '@mui/system';
import { Box, useTheme, ThemeProvider, createTheme } from '@mui/material';
import { FileUpload, FileUploadProps } from './FileUpload/FileUpload';
import { parseIndividualHistory } from './parser/schwabIndividualHistoryParser';
import { parseEACHistory } from './parser/schwabEACHistoryParser';

const theme = createTheme();

const individualUploadProp: FileUploadProps = {
  accept: 'text/csv',
  inputId: 'individual-upload',
  imageButton: false,
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
      if (
          event.target.files !== null &&
          event.target?.files?.length > 0
      ) {
          console.log(`Saving ${event.target.value}`)
          
          const reader = new FileReader();
          reader.onload = (event) => {
            if(typeof event.target?.result === 'string') {
              const data = parseIndividualHistory(event.target?.result);
              console.debug('History', data);
            }
          };
          reader.readAsText(event.target.files[0]);
          
      }
  },
  onDrop: (event: React.DragEvent<HTMLElement>) => {
      console.log(`Drop ${event.dataTransfer.files[0].name}`)
  },
}

const eacUploadProp: FileUploadProps = {
  accept: 'text/csv',
  inputId: 'eac-upload',
  imageButton: false,
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
      if (
          event.target.files !== null &&
          event.target?.files?.length > 0
      ) {
          console.log(`Saving2 ${event.target.value}`)
          
          const reader = new FileReader();
          reader.onload = (event) => {
            if(typeof event.target?.result === 'string') {
              const data = parseEACHistory(event.target?.result);
              console.debug('EAC History', data);
            }
          };
          reader.readAsText(event.target.files[0]);
          
      }
  },
  onDrop: (event: React.DragEvent<HTMLElement>) => {
      console.log(`Drop ${event.dataTransfer.files[0].name}`)
  },
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <div className="App" style={{background: '#AED6F1'}}>
        <Container maxWidth="lg">
          <Box sx={{ bgcolor: '#D6EAF8', height: '100vh' }}>
            <p>INDIVIDUAL HISTORY</p>
            <FileUpload {...individualUploadProp} />

            <p>EQUITY AWARD CENTER HISTORY</p>
            <FileUpload {...eacUploadProp} />
          </Box>
        </Container>
      </div>
    </ThemeProvider>
  );
}

export default App;
