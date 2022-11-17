import { Button } from "@mui/material"
import React from "react"
import DoneRoundedIcon from '@mui/icons-material/DoneRounded';

export type CalculateButtonProps = {
    onClick: () => unknown;
    disabled?: boolean;
    success?: boolean;
    loading?: boolean;
}

export const CalculateButton: React.FC<CalculateButtonProps> = ({
    onClick,
    disabled = false,
    success = false,
    loading = false
}) => {
    const getButtonText = () => {
        if (success) {
            return "Calculated"
        }
        if (loading) {
            return "Calculating..."
        }
        return "Calculate"
    }

    return <Button
        variant="contained"
        disabled={disabled}
        onClick={onClick}
        endIcon={success && <DoneRoundedIcon />}
        color={success ? 'success' : 'primary'}
        sx={[
            {alignSelf: 'center', mt: 1},
            (success || loading) && { pointerEvents: 'none' }
        ]}
    >{getButtonText()}</Button>;
}