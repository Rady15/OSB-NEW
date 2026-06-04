import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useFormValidation } from '../hooks/useFormValidation';

describe('useFormValidation', () => {
    const initialValues = { email: '', password: '' };
    const rules = {
        email: [
            { required: true, message: 'Email is required' },
            { type: 'email', message: 'Invalid email' }
        ],
        password: [
            { required: true, message: 'Password is required' },
            { minLength: 6, message: 'Too short' }
        ]
    };

    it('initializes with empty errors', () => {
        const { result } = renderHook(() =>
            useFormValidation(initialValues, rules)
        );
        expect(result.current.errors).toEqual({});
        expect(result.current.values).toEqual(initialValues);
    });

    it('updates values on handleChange', () => {
        const { result } = renderHook(() =>
            useFormValidation(initialValues, rules)
        );
        act(() => result.current.handleChange('email', 'test@example.com'));
        expect(result.current.values.email).toBe('test@example.com');
    });

    it('validates required fields on submit', async () => {
        const { result } = renderHook(() =>
            useFormValidation(initialValues, rules)
        );
        const onSubmit = async () => {};
        await act(async () => {
            await result.current.handleSubmit(onSubmit);
        });
        expect(result.current.errors.email).toBe('Email is required');
        expect(result.current.errors.password).toBe('Password is required');
    });

    it('rejects invalid email format', async () => {
        const { result } = renderHook(() =>
            useFormValidation(initialValues, rules)
        );
        act(() => result.current.handleChange('email', 'not-an-email'));
        act(() => result.current.handleChange('password', '123456'));
        const onSubmit = async () => {};
        await act(async () => {
            await result.current.handleSubmit(onSubmit);
        });
        expect(result.current.errors.email).toBe('Invalid email');
    });

    it('passes validation with correct values', async () => {
        const { result } = renderHook(() =>
            useFormValidation(initialValues, rules)
        );
        act(() => result.current.handleChange('email', 'user@test.com'));
        act(() => result.current.handleChange('password', 'secret123'));
        const onSubmit = async () => {};
        await act(async () => {
            await result.current.handleSubmit(onSubmit);
        });
        expect(result.current.errors).toEqual({});
    });

    it('enforces minLength on password', async () => {
        const { result } = renderHook(() =>
            useFormValidation(initialValues, rules)
        );
        act(() => result.current.handleChange('email', 'user@test.com'));
        act(() => result.current.handleChange('password', '123'));
        const onSubmit = async () => {};
        await act(async () => {
            await result.current.handleSubmit(onSubmit);
        });
        expect(result.current.errors.password).toBe('Too short');
    });
});
