import { Alert, AlertTitle, Box, Button, Typography } from "@mui/material"
import React from "react"
import DoneRoundedIcon from '@mui/icons-material/DoneRounded';
import { EACTransaction, IndividualTransaction } from "../calculator";
import { FileUpload, FileUploadProps } from "../FileUpload/FileUpload";
import { parseEACHistory } from "../parser/schwabEACHistoryParser";
import { parseIndividualHistory } from "../parser/schwabIndividualHistoryParser";
import { CalculateButton } from "./CalculateButton";

export type CalculationSettings = {
    individualHistory: IndividualTransaction[],
    eacHistory: EACTransaction[]
}

export type InputPanelProps = {
    onCalculate: (settings: CalculationSettings) => Promise<void>;
}

export const InputPanel: React.FC<InputPanelProps> = ({
    onCalculate
}) => {
    const [individualHistory, setIndividualHistory] = React.useState<IndividualTransaction[]>();
    const [eacHistory, setEACHistory] = React.useState<EACTransaction[]>();
    const [individualHistoryError, setIndividualHistoryError] = React.useState();
    const [eacHistoryError, setEACHistoryError] = React.useState();
    const [calculating, setCalculating] = React.useState(false);
    const [calculationDone, setCalculationDone] = React.useState(false);

    const readyToCalculate = individualHistory && eacHistory;
    const hasErrors = !!individualHistoryError || !!eacHistoryError;

    const doCalculate = async () => {
        if(!individualHistory) {
            throw new Error('Missing individual history data');
        }

        if(!eacHistory) {
            throw new Error('Missing EAC history data');
        }

        setCalculating(true);

        try {
            await onCalculate({
                individualHistory,
                eacHistory
            });
        } catch (err: any) {
            // TODO: Display error
            console.error('Error while calculating.', err);
            throw err;
        }

        setCalculating(false);
        setCalculationDone(true);
    }

    const individualUploadProp: FileUploadProps = {
        accept: 'text/csv',
        inputId: 'individual-upload',
        label: 'Individual History',
        success: !!individualHistory,
        error: !!individualHistoryError,
        onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
            if (
                event.target.files !== null &&
                event.target?.files?.length > 0
            ) {
                console.debug(`Saving ${event.target.value}`)
                
                const reader = new FileReader();
                reader.onload = (event) => {
                  if(typeof event.target?.result === 'string') {
                    try {
                        const data = parseIndividualHistory(event.target?.result);
                        console.debug('History', data);
                        setIndividualHistoryError(undefined);
                        setIndividualHistory(data);
                    } catch (err: any) {
                        console.error('Failed to parse inidvidual history.', err);
                        setIndividualHistoryError(err);
                    }
                  }
                };
                reader.readAsText(event.target.files[0]);
            }
        }
    }
      
    const eacUploadProp: FileUploadProps = {
        accept: 'text/csv',
        inputId: 'eac-upload',
        label: 'Equity Award Center History',
        success: !!eacHistory,
        error: !!eacHistoryError,
        onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
            if (
                event.target.files !== null &&
                event.target?.files?.length > 0
            ) {
                console.debug(`Saving ${event.target.value}`)
                
                const reader = new FileReader();
                reader.onload = (event) => {
                  if(typeof event.target?.result === 'string') {
                    try {
                        const data = parseEACHistory(event.target?.result);
                        console.debug('EAC History', data);
                        setEACHistoryError(undefined);
                        setEACHistory(data);
                    } catch (err: any) {
                        console.error('Failed to parse EAC history.', err);
                        setEACHistoryError(err);
                    }
                  }
                };
                reader.readAsText(event.target.files[0]);
            }
        },
    }

    return <Box sx={{
        padding: '10px',
        display: 'flex',
        flexDirection: 'column'
    }}>
        <Typography textAlign={'center'} variant={'h4'} gutterBottom>Input</Typography>
        <Alert severity="error" sx={[
            {display: 'none', mb: 2},
            hasErrors && {display: 'inherit'}
        ]}>
            <AlertTitle>Error</AlertTitle>
            Failed to read the file.
        </Alert>
        <Box sx={{
            display: 'flex',
            justifyContent: 'center'
        }}>
            <FileUpload {...individualUploadProp}></FileUpload>
            <Box width={'1em'}></Box>
            <FileUpload {...eacUploadProp}></FileUpload>
        </Box>
        <CalculateButton
            onClick={doCalculate}
            disabled={!readyToCalculate}
            success={calculationDone}
            loading={calculating}
        />
    </Box>
}