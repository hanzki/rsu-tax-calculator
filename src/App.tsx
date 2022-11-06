import React from 'react';
import './App.css';
import { Container } from '@mui/system';
import { Box, ThemeProvider, createTheme, Card, CardContent, Typography } from '@mui/material';
import { FileUpload, FileUploadProps } from './FileUpload/FileUpload';
import { parseIndividualHistory } from './parser/schwabIndividualHistoryParser';
import { parseEACHistory } from './parser/schwabEACHistoryParser';
import { EACTransaction, IndividualTransaction } from './calculator';
import { Results } from './Results';
import { ECBConverter } from './ecbRates';

const theme = createTheme();


function App() {
  const [individualHistory, setIndividualHistory] = React.useState<IndividualTransaction[]>();
  const [eacHistory, setEACHistory] = React.useState<EACTransaction[]>();
  const [ecbConverter, setECBConverter] = React.useState<ECBConverter>();

  React.useEffect(() => {
    ECBConverter.loadECBData().then(converter => {
      setECBConverter(converter);
    });
  }, []);

  const individualUploadProp: FileUploadProps = {
    accept: 'text/csv',
    inputId: 'individual-upload',
    backgroundColor: theme.palette.grey[100],
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
                setIndividualHistory(data);
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
    backgroundColor: theme.palette.grey[100],
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
                setEACHistory(data);
              }
            };
            reader.readAsText(event.target.files[0]);
            
        }
    },
    onDrop: (event: React.DragEvent<HTMLElement>) => {
        console.log(`Drop ${event.dataTransfer.files[0].name}`)
    },
  }
  

  return (
    <ThemeProvider theme={theme}>
      <div className="App" style={{background: '#AED6F1'}}>
        <Container maxWidth="lg">
          <Box sx={{ bgcolor: '#D6EAF8', height: '100vh', padding: '2rem 5%' }}>
            <Card>
              <CardContent>
                <Typography>INDIVIDUAL HISTORY</Typography>
                <FileUpload {...individualUploadProp} />
                { individualHistory &&
                  <Typography gutterBottom color={theme.palette.success.main}>Data Loaded!</Typography>
                }

                <Typography>EQUITY AWARD CENTER HISTORY</Typography>
                <FileUpload {...eacUploadProp} />
                { eacHistory &&
                  <Typography gutterBottom color={theme.palette.success.main}>Data Loaded!</Typography>
                }
              </CardContent>
            </Card>

            { individualHistory && eacHistory && ecbConverter &&
              <Results individualHistory={individualHistory} eacHistory={eacHistory} ecbConverter={ecbConverter}/>
            }
          </Box>
        </Container>
      </div>
    </ThemeProvider>
  );
}

export default App;
