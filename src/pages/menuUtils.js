// Function to open the menu
export const handleMenuOpen = (setAnchorEl) => (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  // Function to close the menu
  export const handleMenuClose = (setAnchorEl) => () => {
    setAnchorEl(null);
  };
  
  // Function to handle the close of the Change Password dialog and also close the menu
  export const handleChangePasswordClose = (setIsChangePasswordOpen, handleMenuClose) => () => {
    setIsChangePasswordOpen(false);
    handleMenuClose();
  };
  
  // Function to handle the close of the Edit Profile dialog and also close the menu
  export const handleEditProfileClose = (setIsEditProfileOpen, handleMenuClose) => () => {
    setIsEditProfileOpen(false);
    handleMenuClose();
  };
  