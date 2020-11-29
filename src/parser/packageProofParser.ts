import * as yaml from 'js-yaml'
import {BEGIN_PACKAGE_REVIEW, BEGIN_PACKAGE_REVIEW_SIGNATURE, END_PACKAGE_REVIEW} from '../constants'
import {PackageReviewProof} from '../types'
import {camelizeKeys} from '../util'

const throwUnexpectedLineError = (index: number, line: string) => {
  throw new Error(`Failed to parse review. Unexpected line ${index + 1}: "${line}"`)
}

const parseProof = (review: string, signature: string): PackageReviewProof => {
  const reviewObj = (yaml.safeLoad(review) as any)
  return camelizeKeys({
    ...reviewObj,
    date: Date.parse(reviewObj.date),
    signature: signature.trim()
  } as PackageReviewProof)
}

export const getProofs = (proofsString: string) => {
  const lines = proofsString.split("\n")
  const output: PackageReviewProof[] = []
  let isMidReview = false
  let isMidSignature = false
  let currentReview: {lines: string[]; signature?: string} = {lines: [], signature: undefined};
  lines.forEach((line, index) => {
    if (!line.trim()) {
      return
    }

    switch(line) {
      case BEGIN_PACKAGE_REVIEW:
        if (!isMidReview && !isMidSignature) {
          isMidReview = true
          return
        } else {
          throwUnexpectedLineError(index, line)
        }
        break
      case BEGIN_PACKAGE_REVIEW_SIGNATURE:
        if (isMidReview && !isMidSignature) {
          isMidSignature = true
          return
        } else {
          throwUnexpectedLineError(index, line)
        }
        break
      case END_PACKAGE_REVIEW:
        if (isMidReview && isMidSignature) {
          isMidReview = false
          isMidSignature = false
          if (!currentReview.signature) {
            throwUnexpectedLineError(index, line)
            break // Unnecessary break to make Typescript happy
          }
          output.push(parseProof(currentReview.lines.join("\n"), currentReview.signature))
          currentReview = {lines: [], signature: undefined}
          return
        } else {
          throwUnexpectedLineError(index, line)
        }
        break
    }

    if (isMidReview && !isMidSignature) {
      currentReview.lines.push(line)
    } else if (isMidSignature) {
      currentReview.signature = line
    }
  })
  return output
}
