import shortid from 'shortid'
import { ethers } from 'ethers'

export const getKey = (): string => shortid.generate()
export const getString = (bytes32Ref: any): string => ethers.utils.parseBytes32String(bytes32Ref)
export const setBytes32 = (key: string): any => ethers.utils.formatBytes32String(key)
