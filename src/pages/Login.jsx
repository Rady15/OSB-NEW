import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { useFormValidation } from '../hooks/useFormValidation';

const Login = () => {
    const { t, isRTL } = useApp();
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || '/';

    const [focused, setFocused] = useState({ email: false, password: false });
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const validationRules = {
        email: [
            { required: true, message: 'Email is required' },
            { type: 'email', message: 'Please enter a valid email' }
        ],
        password: [
            { required: true, message: 'Password is required' },
            { minLength: 6, message: 'Password must be at least 6 characters' }
        ]
    };

    const { values, errors, touched, isSubmitting, handleChange, handleBlur, handleSubmit } = useFormValidation(
        { email: '', password: '' },
        validationRules
    );

    useEffect(() => {
        setFocused(prev => ({
            ...prev,
            email: !!(touched.email && values.email) || focused.email,
            password: !!(touched.password && values.password) || focused.password,
        }));
    }, [values, touched]);

    const onSubmit = async (formValues) => {
        setError('');
        try {
            const result = await login(formValues.email, formValues.password);
            const loggedInUser = result?.user;
            const defaultPath = loggedInUser?.role === 'admin' ? '/' : '/my-tasks';
            const target = from && from !== '/login' ? from : defaultPath;
            navigate(target, { replace: true });
        } catch (err) {
            setError(err.message || 'Login failed');
        }
    };

    const onFormSubmit = (e) => {
        e.preventDefault();
        handleSubmit(onSubmit);
    };

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');

                .login-page {
                    font-family: 'Poppins', sans-serif;
                    min-height: 100vh;
                    width: 100%;
                    background: #f0f4f3;
                    overflow-x: hidden;
                    position: relative;
                }

                .dark .login-page {
                    background: #1a2332;
                }

                .login-page .wave {
                    position: fixed;
                    bottom: 0;
                    left: 0;
                    height: 100%;
                    z-index: 0;
                    pointer-events: none;
                }

                .dark .login-page .wave {
                    opacity: 0.35;
                }

                .login-page .login-container {
                    width: 100%;
                    min-height: 100vh;
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    grid-gap: 7rem;
                    padding: 0 2rem;
                    position: relative;
                    z-index: 1;
                }

                .login-page .img-side {
                    display: flex;
                    justify-content: flex-end;
                    align-items: center;
                }

                .login-page .login-content {
                    display: flex;
                    justify-content: flex-start;
                    align-items: center;
                    text-align: center;
                }

                .login-page .img-side img {
                    width: 500px;
                    max-width: 100%;
                }

                .login-page form {
                    width: 360px;
                    max-width: 100%;
                }

                .login-page .login-content .avatar {
                    height: 100px;
                }

                .login-page .login-content h2 {
                    margin: 15px 0;
                    color: #333;
                    text-transform: uppercase;
                    font-size: 2.9rem;
                    font-weight: 600;
                }

                .dark .login-page .login-content h2 {
                    color: #f1f5f9;
                }

                .login-page .input-div {
                    position: relative;
                    display: grid;
                    grid-template-columns: 7% 93%;
                    margin: 25px 0;
                    padding: 5px 0;
                    border-bottom: 2px solid #d9d9d9;
                    transition: .3s;
                }

                .login-page .input-div.one {
                    margin-top: 0;
                }

                .login-page .input-div.focus .i i {
                    color: #1d4ed8;
                }

                .login-page .i {
                    color: #d9d9d9;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }

                .login-page .i i {
                    transition: .3s;
                }

                .login-page .input-div > div {
                    position: relative;
                    height: 45px;
                }

                .login-page .input-div > div > h5 {
                    position: absolute;
                    left: 10px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #999;
                    font-size: 18px;
                    transition: .3s;
                    pointer-events: none;
                }

                .login-page[dir="rtl"] .input-div > div > h5 {
                    left: auto;
                    right: 10px;
                }

                .login-page .input-div:before,
                .login-page .input-div:after {
                    content: '';
                    position: absolute;
                    bottom: -2px;
                    width: 0%;
                    height: 2px;
                    background-color: #1d4ed8;
                    transition: .4s;
                }

                .login-page .input-div:before {
                    right: 50%;
                }

                .login-page[dir="rtl"] .input-div:before {
                    right: auto;
                    left: 50%;
                }

                .login-page .input-div:after {
                    left: 50%;
                }

                .login-page[dir="rtl"] .input-div:after {
                    left: auto;
                    right: 50%;
                }

                .login-page .input-div.focus:before,
                .login-page .input-div.focus:after {
                    width: 50%;
                }

                .login-page .input-div.focus > div > h5 {
                    top: -5px;
                    font-size: 15px;
                    color: #1d4ed8;
                }

                .login-page .input-div > div > input {
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: 100%;
                    height: 100%;
                    border: none;
                    outline: none;
                    background: none;
                    padding: 0.5rem 0.7rem;
                    font-size: 1.2rem;
                    color: #555;
                    font-family: 'Poppins', sans-serif;
                }

                .login-page[dir="rtl"] .input-div > div > input {
                    left: auto;
                    right: 0;
                    text-align: right;
                }

                .dark .login-page .input-div > div > input {
                    color: #e2e8f0;
                }

                .login-page .input-div.pass {
                    margin-bottom: 4px;
                }

                .login-page .forgot-link {
                    display: block;
                    text-align: right;
                    text-decoration: none;
                    color: #999;
                    font-size: 0.9rem;
                    transition: .3s;
                    margin-top: 4px;
                }

                .login-page[dir="rtl"] .forgot-link {
                    text-align: left;
                }

                .login-page .forgot-link:hover {
                    color: #1d4ed8;
                }

                .login-page .login-btn {
                    display: block;
                    width: 100%;
                    height: 50px;
                    border-radius: 25px;
                    outline: none;
                    border: none;
                    background-image: linear-gradient(to right, #1e40af, #1d4ed8, #1e40af);
                    background-size: 200%;
                    font-size: 1.2rem;
                    color: #fff;
                    font-family: 'Poppins', sans-serif;
                    text-transform: uppercase;
                    margin: 1rem 0;
                    cursor: pointer;
                    transition: .5s;
                    font-weight: 600;
                    letter-spacing: 0.5px;
                }

                .login-page .login-btn:hover {
                    background-position: right;
                }

                .login-page .login-btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                .login-page .demo-btn {
                    display: inline-block;
                    padding: 10px 28px;
                    border-radius: 25px;
                    outline: none;
                    border: 2px solid #1d4ed8;
                    background: transparent;
                    font-size: 0.95rem;
                    color: #1d4ed8;
                    font-family: 'Poppins', sans-serif;
                    text-transform: uppercase;
                    margin-top: 0.5rem;
                    cursor: pointer;
                    transition: .3s;
                    font-weight: 500;
                }

                .login-page .demo-btn:hover {
                    background: #1d4ed8;
                    color: #fff;
                }

                .login-page .error-box {
                    background: #fee2e2;
                    color: #b91c1c;
                    border-radius: 8px;
                    padding: 10px 14px;
                    font-size: 0.9rem;
                    margin: 12px 0;
                    text-align: start;
                }

                .dark .login-page .error-box {
                    background: rgba(220, 38, 38, 0.15);
                    color: #fca5a5;
                }

                .login-page .spinner-mini {
                    display: inline-block;
                    width: 18px;
                    height: 18px;
                    border: 2px solid rgba(255,255,255,0.4);
                    border-top-color: #fff;
                    border-radius: 50%;
                    animation: spin-mini 0.8s linear infinite;
                    vertical-align: middle;
                    margin-inline-end: 8px;
                }

                @keyframes spin-mini {
                    to { transform: rotate(360deg); }
                }

                @media screen and (max-width: 1050px) {
                    .login-page .login-container {
                        grid-gap: 5rem;
                    }
                }

                @media screen and (max-width: 1000px) {
                    .login-page form { width: 290px; }
                    .login-page .login-content h2 { font-size: 2.4rem; margin: 8px 0; }
                    .login-page .img-side img { width: 400px; }
                }

                @media screen and (max-width: 900px) {
                    .login-page .login-container {
                        grid-template-columns: 1fr;
                    }
                    .login-page .img-side { display: none; }
                    .login-page .login-content { justify-content: center; }
                }
            `}</style>

            <div className="login-page" dir={isRTL ? 'rtl' : 'ltr'}>
                <img src="/login/wave.png" className="wave" alt="" />

                <div className="login-container">
                    {!isRTL && (
                        <div className="img-side">
                            <img src="/login/bg.svg" alt="" />
                        </div>
                    )}

                    <div className="login-content">
                        <form onSubmit={onFormSubmit} noValidate>
                            <img src="/login/avatar.svg" className="avatar" alt="" />
                            <h2 className="title">
                                {isRTL ? 'مرحباً' : 'Welcome'}
                            </h2>

                            {error && <div className="error-box">{error}</div>}

                            <div className={`input-div one ${focused.email || values.email ? 'focus' : ''}`}>
                                <div className="i">
                                    <i className="fas fa-user"></i>
                                </div>
                                <div>
                                    <h5>{isRTL ? 'البريد الإلكتروني' : 'Email'}</h5>
                                    <input
                                        type="email"
                                        className="input"
                                        value={values.email}
                                        onFocus={() => setFocused(f => ({ ...f, email: true }))}
                                        onBlur={() => {
                                            setFocused(f => ({ ...f, email: !!values.email }));
                                            handleBlur('email');
                                        }}
                                        onChange={(e) => handleChange('email', e.target.value)}
                                    />
                                </div>
                            </div>
                            {touched.email && errors.email && (
                                <div style={{ color: '#dc2626', fontSize: '0.8rem', textAlign: isRTL ? 'right' : 'left', marginTop: '-15px', marginBottom: '10px' }}>
                                    {errors.email}
                                </div>
                            )}

                            <div className={`input-div pass ${focused.password || values.password ? 'focus' : ''}`}>
                                <div className="i">
                                    <i className="fas fa-lock"></i>
                                </div>
                                <div>
                                    <h5>{isRTL ? 'كلمة المرور' : 'Password'}</h5>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        className="input"
                                        value={values.password}
                                        onFocus={() => setFocused(f => ({ ...f, password: true }))}
                                        onBlur={() => {
                                            setFocused(f => ({ ...f, password: !!values.password }));
                                            handleBlur('password');
                                        }}
                                        onChange={(e) => handleChange('password', e.target.value)}
                                    />
                                </div>
                            </div>
                            {touched.password && errors.password && (
                                <div style={{ color: '#dc2626', fontSize: '0.8rem', textAlign: isRTL ? 'right' : 'left', marginTop: '-15px', marginBottom: '10px' }}>
                                    {errors.password}
                                </div>
                            )}

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(s => !s)}
                                    style={{
                                        background: 'none', border: 'none', padding: 0,
                                        color: '#999', fontSize: '0.85rem', cursor: 'pointer',
                                        fontFamily: 'Poppins, sans-serif', transition: '.3s',
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.color = '#1d4ed8'}
                                    onMouseLeave={e => e.currentTarget.style.color = '#999'}
                                >
                                    {showPassword ? (isRTL ? 'إخفاء' : 'Hide') : (isRTL ? 'إظهار' : 'Show')}
                                </button>

                                <a href="#" className="forgot-link" onClick={(e) => e.preventDefault()}>
                                    {isRTL ? 'نسيت كلمة المرور؟' : 'Forgot Password?'}
                                </a>
                            </div>

                            <input
                                type="submit"
                                className="login-btn"
                                value={isSubmitting
                                    ? (isRTL ? 'جاري...' : 'Loading...')
                                    : (isRTL ? 'تسجيل الدخول' : 'Login')}
                                disabled={isSubmitting}
                            />

                            <button
                                type="button"
                                className="demo-btn"
                                onClick={() => {
                                    handleChange('email', 'admin.mohamed@gmail.com');
                                    handleChange('password', 'Admin@29');
                                    setFocused({ email: true, password: true });
                                }}
                            >
                                {isRTL ? 'تسجيل دخول تجريبي' : 'Demo Login'}
                            </button>
                        </form>
                    </div>

                    {isRTL && (
                        <div className="img-side">
                            <img src="/login/bg.svg" alt="" />
                        </div>
                    )}
                </div>
            </div>

            <link
                rel="stylesheet"
                href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css"
            />
        </>
    );
};

export default Login;
