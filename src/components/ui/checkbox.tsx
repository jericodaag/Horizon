import React from 'react';

interface CheckboxProps {
    id: string;
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
    className?: string;
}

const Checkbox: React.FC<CheckboxProps> = ({ id, checked, onCheckedChange, className = '' }) => {
    return (
        <input
            type="checkbox"
            id={id}
            checked={checked}
            onChange={(e) => onCheckedChange(e.target.checked)}
            className={`h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500 ${className}`}
        />
    );
};

export { Checkbox };