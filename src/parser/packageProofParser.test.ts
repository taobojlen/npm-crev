import {getProofs} from './packageProofParser'
import {promises as fs} from 'fs'
import {PackageReviewProof} from '../types'

const expectedProofOne: PackageReviewProof = {
  version: -1,
  date: Date.parse('2018-12-18T23:10:21.111854021-08:00'),
  from: {
    idType: 'crev',
    id: 'FYlr8YoYGVvDwHQxqEIs89reKKDy-oWisoO0qXXEfHE',
    url: 'https://github.com/dpc/crev-proofs',
  },
  package: {
    source: 'https://crates.io',
    name: 'log',
    version: '0.4.6',
    digest: 'BhDmOOjfESqs8i3z9qsQANH8A39eKklgQKuVtrwN-Tw',
  },
  review: {
    thoroughness: 'low',
    understanding: 'medium',
    rating: 'positive',
  },
  signature: "4R2WjtU-avpBznmJYAl44H1lOYgETu3RSNhCDcB4GpqhJbSRkd-eqnUuhHgDUs77OlhUf7BSA0dydxaALwx0Dg"
}

const expectedProofTwo: PackageReviewProof = {
  version: -1,
  date: Date.parse("2018-12-27T15:03:34.189335776-08:00"),
  from: {
    idType: "crev",
    id: "FYlr8YoYGVvDwHQxqEIs89reKKDy-oWisoO0qXXEfHE",
    url: "https://github.com/dpc/crev-proofs"
  },
  package: {
    source: "https://crates.io",
    name: "crates_io_api",
    version: "0.3.0",
    revision: "734324f1bb29c094dc0749efce3dab8ca6822f45",
    digest: "XWZhBHowu-uzuWl_rXm5jDcCfoiLvZT87do09OtS4aQ"
  },
  review: {
    thoroughness: "low",
    understanding: "high",
    rating: "positive"
  },
  comment: "LGTM",
  signature: "jueGBe_uOHxZUPv9hypDdN0uHmWaXSiHEEQMVFXgYxbHst5ZfvqGn1RdeNsBkHnohL__nymXGa_2OSq0EIYdCA"
}

it('parses a single proof file', async () => {
  const proofYaml = (await fs.readFile('test/data/single-package.proof.crev')).toString()
  const proofs = getProofs(proofYaml)
  expect(proofs.length).toBe(1)
  expect(proofs[0]).toStrictEqual(expectedProofOne)
})

it('parses a multiple proof file', async () => {
  const proofYaml = (await fs.readFile('test/data/multiple-packages.proof.crev')).toString()
  const proofs = getProofs(proofYaml)
  expect(proofs.length).toBe(2)
  expect(proofs.sort()).toStrictEqual([expectedProofOne, expectedProofTwo].sort())
})