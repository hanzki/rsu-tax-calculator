import { Alert, AlertTitle, Typography } from "@mui/material";
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';

export type WarningAlertProps = {
    warnings: string[];
    display: boolean;
}

export const WarningAlert: React.FC<WarningAlertProps> = ({
    warnings = [],
    display
}) => {
    const warningItems = warnings.map(warningMessage => <Typography><PriorityHighIcon fontSize="inherit" sx={{mr: 0.5}}/>{warningMessage}</Typography>);

    return <Alert severity="warning" sx={[
        {display: 'none', mb: 2},
        display && {display: 'inherit'}
    ]}>
        <AlertTitle>Warning</AlertTitle>
        <Typography gutterBottom={true}>Your data includes some transactions that are not fully supported and might lead to errors in the calculation.</Typography>
        {warningItems}
        <Typography sx={{ mt: 1}} fontWeight='bold'>Please verify that the results are correct.</Typography>

    </Alert>
}