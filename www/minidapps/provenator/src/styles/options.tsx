export const OptionsStyles = {
  option: (provided: any, state: any) => ({
    ...provided,
    backgroundColor: state.isSelected ? '#377D82': '#fff'
  })
}
