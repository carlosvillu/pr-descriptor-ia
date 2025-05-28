import type * as core from '@actions/core'
import { jest } from '@jest/globals'

export const debug = jest.fn<typeof core.debug>()
export const error = jest.fn<typeof core.error>()
export const info = jest.fn<typeof core.info>()
export const warning = jest.fn<typeof core.warning>()
export const getInput = jest.fn<typeof core.getInput>()
export const setOutput = jest.fn<typeof core.setOutput>()
export const setFailed = jest.fn<typeof core.setFailed>()
export const notice = jest.fn<typeof core.notice>()
export const startGroup = jest.fn<typeof core.startGroup>()
export const endGroup = jest.fn<typeof core.endGroup>()
export const setSecret = jest.fn<typeof core.setSecret>()
export const addPath = jest.fn<typeof core.addPath>()
export const exportVariable = jest.fn<typeof core.exportVariable>()
export const getBooleanInput = jest.fn<typeof core.getBooleanInput>()
export const getMultilineInput = jest.fn<typeof core.getMultilineInput>()
export const setCommandEcho = jest.fn<typeof core.setCommandEcho>()
export const isDebug = jest.fn<typeof core.isDebug>().mockReturnValue(false)
export const saveState = jest.fn<typeof core.saveState>()
export const getState = jest.fn<typeof core.getState>()
export const group = jest.fn<typeof core.group>()

// Annotation functions
export const annotationProperties = {
  title: '',
  file: '',
  startLine: 0,
  endLine: 0,
  startColumn: 0,
  endColumn: 0
}

export class AnnotationError extends Error {
  constructor(message: string, properties = annotationProperties) {
    super(message)
    this.name = 'AnnotationError'
  }
}

// Export summary mock
export const summary = {
  addBreak: jest.fn().mockReturnThis(),
  addCodeBlock: jest.fn().mockReturnThis(),
  addDetails: jest.fn().mockReturnThis(),
  addEOL: jest.fn().mockReturnThis(),
  addHeading: jest.fn().mockReturnThis(),
  addImage: jest.fn().mockReturnThis(),
  addLink: jest.fn().mockReturnThis(),
  addList: jest.fn().mockReturnThis(),
  addQuote: jest.fn().mockReturnThis(),
  addRaw: jest.fn().mockReturnThis(),
  addSeparator: jest.fn().mockReturnThis(),
  addTable: jest.fn().mockReturnThis(),
  clear: jest.fn().mockReturnThis(),
  emptyBuffer: jest.fn().mockReturnThis(),
  isEmptyBuffer: jest.fn().mockReturnValue(true),
  stringify: jest.fn().mockReturnValue(''),
  // @ts-expect-error error
  write: jest.fn().mockResolvedValue(summary)
}

// Export OIDC mock
export const oidc = {
  getIDToken: jest
    .fn<() => Promise<string>>()
    .mockResolvedValue('mock-id-token')
}

// Export other utilities
export const toPlatformPath = jest.fn((path: string) => path)
export const toWin32Path = jest.fn((path: string) => path.replace(/\//g, '\\'))
export const toPosixPath = jest.fn((path: string) => path.replace(/\\/g, '/'))

// Export platform mock
export const platform = {
  platform: 'linux',
  arch: 'x64'
}
