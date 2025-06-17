import React, { useState, useEffect, useRef } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    IconButton,
    Typography,
    Box,
    TextField,
    Button,
    Autocomplete,
    Chip
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const TagModal = ({ open, onClose, tags = [], selectedTags = [], onSave }) => {
    const [localSelectedTags, setLocalSelectedTags] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const inputRef = useRef();

    useEffect(() => {
        if (open && inputRef.current) {
            setTimeout(() => inputRef.current.focus(), 150);
        }
    }, [open]);

    useEffect(() => {
        setLocalSelectedTags(selectedTags);
    }, [selectedTags]);

    const handleAddTag = (value) => {
        const cleanTag = value.trim();
        if (cleanTag && !localSelectedTags.includes(cleanTag)) {
            const newTags = [...localSelectedTags, cleanTag];
            setLocalSelectedTags(newTags);
            setInputValue('');
            onSave(newTags);
        } else {
            setInputValue('');
        }
    };

    const handleDeleteTag = (tagToDelete) => {
        const newTags = localSelectedTags.filter((tag) => tag !== tagToDelete);
        setLocalSelectedTags(newTags);
        onSave(newTags);
    };

    const handleSave = () => {
        let tagsToSave = localSelectedTags;
        const cleanInput = inputValue.trim();
        if (cleanInput && !localSelectedTags.includes(cleanInput)) {
            tagsToSave = [...localSelectedTags, cleanInput];
            setLocalSelectedTags(tagsToSave); 
            setInputValue('');
        }
        onSave(tagsToSave);
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle
                sx={{
                    textAlign: 'center',
                    fontWeight: 700,
                    fontSize: 24,
                    pb: 1,
                    color: 'primary.main',
                    position: 'relative'
                }}
            >
                Quản lý tag
                <IconButton
                    onClick={onClose}
                    sx={{ position: 'absolute', right: 16, top: 16 }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent sx={{ pt: 2 }}>
                <Box sx={{ mb: 3 }}>
                    <Autocomplete
                        multiple
                        freeSolo
                        id="tags-autocomplete"
                        options={tags}
                        value={localSelectedTags}
                        inputValue={inputValue}
                        onInputChange={(_, newInputValue) => setInputValue(newInputValue)}
                        onChange={(_, newValue) => {
                            setLocalSelectedTags(newValue);
                            onSave(newValue);
                        }}
                        filterSelectedOptions
                        renderTags={(value, getTagProps) =>
                            value.map((option, index) => {
                                const { key, ...tagProps } = getTagProps({ index });
                                return (
                                    <Chip
                                        key={option}
                                        variant="outlined"
                                        label={option}
                                        size="small"
                                        {...tagProps}
                                        onDelete={() => handleDeleteTag(option)}
                                    />
                                );
                            })
                        }
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                variant="outlined"
                                placeholder="Nhập tag mới hoặc chọn tag..."
                                inputRef={inputRef}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && inputValue.trim() && !localSelectedTags.includes(inputValue.trim())) {
                                        handleAddTag(inputValue);
                                        e.preventDefault();
                                    }
                                }}
                                sx={{
                                    bgcolor: '#fff',
                                    borderRadius: 2,
                                    fontSize: 16,
                                    '& .MuiInputBase-root': {
                                        minHeight: 44
                                    }
                                }}
                                inputProps={{ ...params.inputProps, maxLength: 32 }}
                            />
                        )}
                    />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                    <Button
                        onClick={handleSave}
                        variant="contained"
                        color="primary"
                        sx={{ height: 44, px: 3, fontWeight: 600, textTransform: 'none', borderRadius: 2 }}
                    >
                        Thêm tag
                    </Button>
                </Box>
            </DialogContent>
        </Dialog>
    );
};

export default TagModal;
