import { useState, useCallback } from 'react';

export const useFormValidation = (initialValues, validationRules) => {
    const [values, setValues] = useState(initialValues);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const validate = useCallback((fieldValues = values) => {
        const newErrors = {};
        for (const field in validationRules) {
            const rules = validationRules[field];
            const value = fieldValues[field];

            for (const rule of rules) {
                if (rule.required && (!value || (typeof value === 'string' && !value.trim()))) {
                    newErrors[field] = rule.message || `${field} is required`;
                    break;
                }
                if (rule.type === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                    newErrors[field] = rule.message || 'Invalid email address';
                    break;
                }
                if (rule.minLength && value && value.length < rule.minLength) {
                    newErrors[field] = rule.message || `Must be at least ${rule.minLength} characters`;
                    break;
                }
                if (rule.pattern && value && !rule.pattern.test(value)) {
                    newErrors[field] = rule.message || 'Invalid format';
                    break;
                }
                if (rule.custom && value) {
                    const customError = rule.custom(value);
                    if (customError) {
                        newErrors[field] = customError;
                        break;
                    }
                }
            }
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [values, validationRules]);

    const handleChange = useCallback((field, value) => {
        setValues(prev => ({ ...prev, [field]: value }));
    }, []);

    const handleBlur = useCallback((field) => {
        setTouched(prev => ({ ...prev, [field]: true }));
        validate();
    }, [validate]);

    const handleSubmit = useCallback(async (onSubmit) => {
        setIsSubmitting(true);
        setTouched(Object.keys(values).reduce((acc, key) => ({ ...acc, [key]: true }), {}));
        const isValid = validate();
        if (isValid) {
            try {
                await onSubmit(values);
            } catch (err) {
                setIsSubmitting(false);
                throw err;
            }
        }
        setIsSubmitting(false);
        return isValid;
    }, [values, validate]);

    const reset = useCallback(() => {
        setValues(initialValues);
        setErrors({});
        setTouched({});
        setIsSubmitting(false);
    }, [initialValues]);

    return {
        values,
        errors,
        touched,
        isSubmitting,
        handleChange,
        handleBlur,
        handleSubmit,
        reset,
        validate
    };
};
