import React from 'react';
import '../App.css';
import axios from 'axios';
import defaultProfile from '../images/default.png'
import { checkString, checkMatchingStrings } from '../validation';
import { Button, Box, OutlinedInput, InputLabel, FormControl, InputAdornment, IconButton, Modal } from '@mui/material';
import { Visibility, VisibilityOff, DeleteForever, LockReset, Cancel } from '@mui/icons-material';

import { getAuth, updatePassword, deleteUser } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import xss from 'xss';

import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Credentials({ setIsLoggedIn, currentUserEmail, currentUserID }) {
    //modal handlers
    const [open, setOpen] = React.useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    //State handlers
	const [data, setData] = React.useState({
		password: '',
        confirmPassword: '',
		showPassword: false,
        showConfirmPassword: false,
	});

    const [ pfpLink, setPfpLink ] = React.useState('');
    const [imgFile, setImgFile] = React.useState(null);

    const id = checkString(currentUserID);

    const navigate = useNavigate();
    const auth = getAuth();

    const user = auth.currentUser;

    React.useEffect(() => {
        async function fetchData() {
			const id = checkString(currentUserID);
			try {
				const { data } = await axios.get(`http://localhost:4000/account/pfpmain/${id}`);
                if (data === null || data === '') {
                    setPfpLink(defaultProfile);
                } else {
                    setPfpLink('data:image/;base64,'+data);
                }
			} catch (e) {
                console.log(e);
            }
		}
		fetchData();
    }, []);

    const handleImgSubmitChange = async (event) => {
        setImgFile(event.target.files[0]);
    }

    const handleSubmitImg = async (event) => {
        event.preventDefault();
        if(imgFile !== null){
            if (imgFile.size>8388608){
                toast.error("Please keep the image smaller than 8MB!")
                setImgFile(null);
            } else {
                const form = new FormData();
                form.append('img', imgFile);
                try {
                    toast.success('Image uploading! Just give us a minute to process it. Refresh the page in a bit to see the changes :)');
                    await axios.post(`http://localhost:4000/account/${id}/profilepicture`, form);
                } catch (e) {
                    toast.error('Error uploading and processing image');
                }
            }
        } else {
            toast.error("Please choose a file!");
        }
    }

	const handleChange = (prop) => (event) => {
		setData({ ...data, [prop]: event.target.value });
	}

	const handleShowPassword = () => {
		setData({ ...data, showPassword: !data.showPassword });
	}

    const handleShowConfirmPassword = () => {
		setData({ ...data, showConfirmPassword: !data.showConfirmPassword });
	}

	const handlePasswordChange = async () => {
		try {
			let cleanPassword = checkString(xss(data.password));
			setData({...data, password: cleanPassword});
			let cleanConfirmPassword = checkString(xss(data.confirmPassword));
			setData({...data, confirmPassword: cleanConfirmPassword});
            try {
                checkMatchingStrings(data.password, data.confirmPassword);
                try {
                    let user = auth.currentUser;
                    await updatePassword(user, data.password);
                    toast.success('Password has been updated!');
                } catch (e) { 
                    if(e.code === 'auth/requires-recent-login'){
                        toast.error('To make sure its really you, please log out then back in again.');
                    } else{
                        toast.error('Error changing password, please try again.');
                    }
                }
            } catch { toast.error('Provided passwords do not match, please try again') }
		} catch { toast.error('Passwords entered are not valid strings, please try again') }
        setData({ ...data, password: '' });
        setData({ ...data, confirmPassword: '' });
        document.getElementById("newPassword").value = '';
        document.getElementById("newConfirmPassword").value = '';
	}

	const handleDelete = async () => {
		try {
            let user = auth.currentUser;
            await deleteUser(user);
			setIsLoggedIn(false);
			toast.success('Your account has been deleted.');
			navigate('/');
		} catch (e) {
            if(e.code === 'auth/requires-recent-login'){
                toast.error('To make sure its really you, please log out then back in again.');
            } else{
                toast.error("Error deleting your account, please try again");
            }
		}
	}

	const handlePreventDefault = (event) => {
		event.preventDefault();
	}

    if(user.providerData[0].providerId === 'google.com'){
        return (
            <div>
            <h1>Account Details</h1>
			<Box 
				sx={{
					width: 350,
					height: 500,
				}}
			>
                <h2>Account Email: <span className="smallText">&nbsp;&nbsp;&nbsp;{currentUserEmail}</span></h2>
                <h2>Profile Picture: </h2>
                <img src={pfpLink} referrerPolicy="no-referrer" alt="Profile Pic" />
                <form>
                    <label htmlFor='imgFile'>Upload New Picture File:</label>
                    <input 
                        type="file" 
                        id='imgFile'
                        defaultValue={imgFile}
                        accept="image/png, image/jpeg, image/jpg" 
                        onChange={handleImgSubmitChange}
                    />
                    <p>Only 'png' and 'jpeg'/'jpg' images accepted</p>
                    <Button
                        label='submit profile photo'
                        sx={{ backgroundColor: '#181818', '&:hover': { backgroundColor: 'black'}, }}
                        variant='contained' 
                        onClick={handleSubmitImg}
                        id="loginSignupDeleteButton">
                            Upload new photo
                    </Button>
                </form>
                <h2>Update Password: </h2>
                <p>Accounts logged in through google cannot change password</p>
                <Button 
					aria-label='Delete user'
					color='error'
					variant='contained' 
					endIcon={<DeleteForever />}
					onClick={handleOpen}
					onMouseDown={handlePreventDefault}
					id="deleteButton">
						Delete user
				</Button>
                <Modal
                    open={open}
                    onClose={handleClose}
                    aria-label="Delete user confimation modal"
                    aria-description="This action can not be undone"
                    >
                    <Box sx={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: 400,
                      bgcolor: 'background.paper',
                      borderRadius: '8px',
                      textAlign: 'center',
                      boxShadow: 24,
                    }}>
                        <h2>Are you sure you want to delete your account?</h2>
                        <p>This action cannot be undone</p>
                        <Button 
                            aria-label='cancel delete user'
                            sx={{ backgroundColor: '#181818', '&:hover': { backgroundColor: 'black'}, }}
                            variant='contained' 
                            endIcon={<Cancel />}
                            onClick={handleClose}
                            onMouseDown={handlePreventDefault}
                            className="modalButton">
                                Cancel
                        </Button>
                        <Button 
                            aria-label='Delete user'
                            color='error'
                            variant='contained' 
                            endIcon={<DeleteForever />}
                            onClick={handleDelete}
                            onMouseDown={handlePreventDefault}
                            className="modalButton">
                                Delete user
                        </Button>
                    </Box>
                </Modal>
			</Box>
		</div>
        );
    } else {
        return (
            <div>
            <h1>Account Details</h1>
			<Box 
				sx={{
					width: 350,
					height: 500,
				}}
			>
                <h2>Account Email: <span className="smallText">&nbsp;&nbsp;&nbsp;{currentUserEmail}</span></h2>
                <h2>Profile Picture: </h2>
                <img src={pfpLink} referrerPolicy="no-referrer" alt="Profile Pic" />
                <form>
                    <label htmlFor='imgFile'>Upload New Picture File:</label>
                    <input 
                        type="file" 
                        id='imgFile'
                        defaultValue={imgFile}
                        accept="image/png, image/jpeg, image/jpg" 
                        onChange={handleImgSubmitChange}
                    />
                    <p>Only 'png' and 'jpeg'/'jpg' images accepted</p>
                    <Button
                        label='submit profile photo'
                        sx={{ backgroundColor: '#181818', '&:hover': { backgroundColor: 'black'}, }}
                        variant='contained' 
                        onClick={handleSubmitImg}
                        id="loginSignupDeleteButton">
                            Upload new photo
                    </Button>
                </form>
                <h2>Change Password: </h2>
				<FormControl variant='outlined' id='loginSignupPasswordContainer'>
					<InputLabel htmlFor='newPassword'>New Password</InputLabel>
					<OutlinedInput 
						label = 'New Password'
						id='newPassword'
						type={data.showPassword ? 'text' : 'password'}
						value={data.password}
						onChange={handleChange('password')}
						endAdornment={
							<InputAdornment position='end'>
								<IconButton 
									aria-label='Toggle Password Visibility' 
									onClick={handleShowPassword}
									onMouseDown={handlePreventDefault}
									edge='end'
								>
									{data.showPassword ? <VisibilityOff /> : <Visibility />}
								</IconButton>
							</InputAdornment>
						}
					/>
				</FormControl>
				<FormControl variant='outlined' id='signupConfirmPasswordContainer'>
					<InputLabel htmlFor='newConfirmPassword'>Confirm New Password</InputLabel>
					<OutlinedInput 
						label = 'Confirm New Password'
						id='newConfirmPassword' 
						type={data.showConfirmPassword ? 'text' : 'password'}
						value={data.confirmPassword}
						onChange={handleChange('confirmPassword')}
						endAdornment={
							<InputAdornment position='end'>
								<IconButton 
									aria-label='Toggle Confirm Password Visibility' 
									onClick={handleShowConfirmPassword}
									onMouseDown={handlePreventDefault}
									edge='end'
								>
									{data.showConfirmPassword ? <VisibilityOff /> : <Visibility />}
								</IconButton>
							</InputAdornment>
						}
					/>
				</FormControl>
                <Button
                    aria-label='update password'
					sx={{ backgroundColor: '#181818', '&:hover': { backgroundColor: 'black'}, }}
					variant='contained' 
					endIcon={<LockReset />}
					onClick={handlePasswordChange}
					onMouseDown={handlePreventDefault}
					id="loginSignupDeleteButton">
						Update Password
                </Button>
                <Button 
					aria-label='Delete user'
                    color='error'
					variant='contained' 
					endIcon={<DeleteForever />}
					onClick={handleOpen}
					onMouseDown={handlePreventDefault}
					id="deleteButton">
						Delete user
				</Button>
                <Modal
                    open={open}
                    onClose={handleClose}
                    aria-label="Delete user confimation modal"
                    aria-description="This action can not be undone"
                    >
                    <Box sx={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: 400,
                      bgcolor: 'background.paper',
                      borderRadius: '8px',
                      textAlign: 'center',
                      boxShadow: 24,
                    }}>
                        <h2>Are you sure you want to delete your account?</h2>
                        <p>This action cannot be undone</p>
                        <Button 
                            aria-label='cancel delete user'
                            sx={{ backgroundColor: '#181818', '&:hover': { backgroundColor: 'black'}, }}
                            variant='contained' 
                            endIcon={<Cancel />}
                            onClick={handleClose}
                            onMouseDown={handlePreventDefault}
                            className="modalButton">
                                Cancel
                        </Button>
                        <Button 
                            aria-label='Delete user'
                            color='error'
                            variant='contained' 
                            endIcon={<DeleteForever />}
                            onClick={handleDelete}
                            onMouseDown={handlePreventDefault}
                            className="modalButton">
                                Delete user
                        </Button>
                    </Box>
                </Modal>
			</Box>
		</div>
        );
    }
}