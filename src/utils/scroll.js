// Utility function to scroll to dashboard section
export const scrollToDashboard = () => {
  window.scrollTo({
    top: window.innerHeight * 0.75,
    behavior: 'smooth'
  });
};