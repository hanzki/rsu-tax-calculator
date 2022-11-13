import React from 'react'
import { Box, Typography, Input } from '@mui/material'

import UploadFileIcon from '@mui/icons-material/UploadFileRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ErrorRoundedIcon from '@mui/icons-material/ErrorRounded';

export type FileUploadProps = {
    accept: string
    success?: boolean
    error?: boolean
    inputId?: string
    label?: string
    width?: string
    height?: string
    backgroundColor?: string
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
}

export const FileUpload: React.FC<FileUploadProps> = ({
    accept,
    success = false,
    error = false,
    inputId = 'file-upload',
    label = 'Click or drag to upload file',
    width = '100px',
    height = '100px',
    backgroundColor = '#fff',
    onChange,
}) => {
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        onChange(event)
    }

    const icon = () => {
        if (error) {
            return <ErrorRoundedIcon fontSize="inherit" color='error'/>
        }
        if (success) {
            return <CheckCircleRoundedIcon fontSize='inherit' color='success'/>
        }
        return <UploadFileIcon fontSize="inherit" />
    }

    return (
        <Box sx={{
            display: 'inline-flex',
            flexDirection: 'column',
            alignItems: 'center',
        }}>
            <Input
                onChange={handleChange}
                inputProps={{accept: accept}}
                sx={{display: 'none'}}
                id={inputId}
                type="file"
            />
            <Box
                component='label'
                width={width}
                height={height}
                bgcolor={backgroundColor}
                borderRadius={2}
                htmlFor={inputId}
                sx={[
                    {
                        cursor: 'pointer',
                        textAlign: 'center',
                        justifyContent: 'center',
                        alignItems: 'center',
                        display: 'flex',
                        border: 1,
                        borderColor: 'grey.400',
                        '&:hover p,&:hover svg': {
                            opacity: 1,
                        },
                        '& p, svg': {
                            opacity: 0.5,
                        },
                        fontSize: '48px'
                    },
                    success && {
                        pointerEvents: 'none',
                        borderColor: 'success.light',
                        'svg': {
                            opacity: 1
                        }
                    },
                    error && {
                        borderColor: 'error.light',
                        'svg': {
                            opacity: 1
                        }
                    },
                ]}
            >
                {icon()}
            </Box>
            <Typography
                component="label"
                textAlign={'center'}
                width={`calc(${width} + 1em)`}
                gutterBottom
            >{label}</Typography>
        </Box>
    )
}
