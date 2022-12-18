import React from "react"
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

export type PeriodSelectorProps = {
    options: string[],
    selection: string,
    setSelection: (selection: string) => unknown,
}

export const PeriodSelector: React.FC<PeriodSelectorProps> = ({
    options,
    selection,
    setSelection
}) => {

    const handleChange = (
        event: React.MouseEvent<HTMLElement>,
        newSelection: string,
    ) => {
        if (newSelection != null) {
            setSelection(newSelection);
        }
    };

    return <ToggleButtonGroup
        color="primary"
        value={selection}
        exclusive
        onChange={handleChange}
        aria-label="Period"
        sx={{justifyContent: 'center', mb: 2}}
    >
        {options.map(option => <ToggleButton key={`period-selector-option-${option}`} value={option}>{option}</ToggleButton>)}
    </ToggleButtonGroup>
}