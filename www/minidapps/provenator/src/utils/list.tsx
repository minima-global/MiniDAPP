import { compose } from 'redux'

export const getList = (props: String[]): string => {
  let xs: string = ``
  props.forEach((value) => {
    xs += `${value}<br />`
  })
  return xs
}

export const getKeyedList = (props: Object): string[] =>
  Object.entries(props).map((entry) =>
    `**${entry[0]}**: ${entry[1]}`
  )

  // // compose = (f, g) => x => f(g(x))
  export const get = compose(getList, getKeyedList)
