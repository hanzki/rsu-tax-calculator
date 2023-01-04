import { Alert, AlertTitle } from "@mui/material";

export type ErrorAlertProps = {
    error?: Error | string;
    display: boolean;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({
    error,
    display
}) => {

    const errorMsg = (): string => {
        if (error instanceof Error) {
            return `File parsing failed. Reason: "${error.message}"`;
        }
        if (typeof error === 'string') {
            return `File parsing failed. Reason: "${error}"`;
        }
        return `File parsing failed.`;
    }

    return <Alert severity="error" sx={[
        {display: 'none', mb: 2},
        display && {display: 'inherit'}
    ]}>
        <AlertTitle>Error</AlertTitle>
        {errorMsg()}
    </Alert>
}