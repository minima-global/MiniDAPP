import { PayloadProps } from '../store'
import { flatten } from 'flat'

export const getDictEntries = (props: PayloadProps): string => {
  let xs: string = ``
  const flatObject: any = flatten(props)
  Object.keys(flatObject).forEach((key: string) => {

    const newKey = key.match(/[a-z]+$/i)
    xs += `**${newKey}**: `
    switch (typeof flatObject[key]) {
      case 'number': {
        const value: number = flatObject[key] as number
        xs += `${value} <br />`
        return
      }
      case 'string': {
        const value: string = flatObject[key] as string
        xs += `${value} <br />`
        return
      }
      case 'boolean': {
        const value: boolean = flatObject[key] as boolean
        xs += `${value} <br />`
        return
      }
      case 'object': {
        return xs += `<br />`
      }
      case 'function': {
        return xs += `<br />`
      }
      default:
        console.log("getDictEntries Error!", typeof flatObject[key])
        return xs += ``
    }

  })
  return xs
}
