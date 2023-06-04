module.exports = (successMessage) => {
  return (error) => {
    if (error) {
      console.log(`Error:\n${error}`);
      return
    }
    console.log(successMessage)
  }
}