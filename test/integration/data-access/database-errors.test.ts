import 'mocha'
import * as chai from 'chai'
import * as chaiAsPromised from 'chai-as-promised'

import { insertUser } from '../../../src/data-access/users'
import { DatabaseError, DatabaseErrorMessage } from '../../../src/utils/errors'
import { seedDatabase } from '../../helpers/helpers'

chai.use(chaiAsPromised)
const { assert } = chai

describe('Data Access - Database Errors', function (): void {
  before(async function () {
    await seedDatabase()
  })

  const exampleAddresses = [
    {
      payment_network: 'ABC',
      environment: 'XYZ',
      details: {
        address: 'abc.xyz',
        tag: '123',
      },
    },
  ]

  // Account table errors (PayID)

  it('Raises an error when attempting to insert a user with an null PayID', async function () {
    // GIVEN a PayID and associated addresses to insert
    const payId = null

    // WHEN we insert the user into the database
    // eslint-disable-next-line
    // @ts-ignore
    const insertedAddresses = insertUser(payId, exampleAddresses)

    // THEN we get a DatabaseError with our expected error message
    return assert.isRejected(
      insertedAddresses,
      DatabaseError,
      DatabaseErrorMessage.NotNull,
    )
  })

  it('Raises an error when attempting to insert a user with an empty PayID', async function () {
    // GIVEN a PayID and associated addresses to insert
    const payId = ''

    // WHEN we insert the user into the database
    const insertedAddresses = insertUser(payId, exampleAddresses)

    // THEN we get a DatabaseError with our expected error message
    return assert.isRejected(
      insertedAddresses,
      DatabaseError,
      DatabaseErrorMessage.EmptyStringPayId,
    )
  })

  it('Raises an error when attempting to insert a user with an uppercase PayID', async function () {
    // GIVEN a PayID and associated addresses to insert
    const payId = 'ALICE$example.com'

    // WHEN we insert the user into the database
    const insertedAddresses = insertUser(payId, exampleAddresses)

    // THEN we get a DatabaseError with our expected error message
    return assert.isRejected(
      insertedAddresses,
      DatabaseError,
      DatabaseErrorMessage.StringCasePayId,
    )
  })

  it('Raises an error when attempting to insert a user with a PayID already in use', async function () {
    // GIVEN a PayID and associated addresses to insert
    const payId = 'alice$xpring.money'

    // WHEN we insert the user into the database
    const insertedAddresses = insertUser(payId, exampleAddresses)

    // THEN we get a DatabaseError with our expected error message
    return assert.isRejected(
      insertedAddresses,
      DatabaseError,
      DatabaseErrorMessage.UniqueConstraintPayId,
    )
  })

  // Address table errors

  it('Raises an error when attempting to insert an address with a NULL details payload', async function () {
    // GIVEN a PayID and associated addresses to insert
    const payId = 'alice$example.com'
    const addresses = [
      {
        payment_network: 'XRPL',
        environment: 'TESTNET',
      },
    ]

    // WHEN we insert the user into the database
    // eslint-disable-next-line
    // @ts-ignore
    const insertedAddresses = insertUser(payId, addresses)

    // THEN we get a DatabaseError with our expected error message
    return assert.isRejected(
      insertedAddresses,
      DatabaseError,
      DatabaseErrorMessage.NotNull,
    )
  })

  it('Raises an error when attempting to insert an address with an empty payment_network', async function () {
    // GIVEN a PayID and associated addresses to insert
    const payId = 'alice$example.com'
    const addresses = [
      {
        payment_network: '',
        environment: 'TESTNET',
        details: {
          address: 'abc',
        },
      },
    ]

    // WHEN we insert the user into the database
    const insertedAddresses = insertUser(payId, addresses)

    // THEN we get a DatabaseError with our expected error message
    return assert.isRejected(
      insertedAddresses,
      DatabaseError,
      DatabaseErrorMessage.EmptyStringPaymentNetwork,
    )
  })

  it('Raises an error when attempting to insert an address with an empty environment', async function () {
    // GIVEN a PayID and associated addresses to insert
    const payId = 'alice$example.com'
    const addresses = [
      {
        payment_network: 'XRPL',
        environment: '',
        details: {
          address: 'abc',
        },
      },
    ]

    // WHEN we insert the user into the database
    const insertedAddresses = insertUser(payId, addresses)

    // THEN we get a DatabaseError with our expected error message
    return assert.isRejected(
      insertedAddresses,
      DatabaseError,
      DatabaseErrorMessage.EmptyStringEnvironment,
    )
  })

  it('Raises an error when attempting to insert multiple addresses for the same (payment_network, environment)', async function () {
    // GIVEN a PayID and associated addresses to insert
    const payId = 'alice$example.com'
    const addresses = [
      {
        payment_network: 'XRPL',
        environment: 'TESTNET',
        details: {
          address: 'abc',
        },
      },
      {
        payment_network: 'XRPL',
        environment: 'TESTNET',
        details: {
          address: 'xyz',
        },
      },
    ]

    // WHEN we insert the user into the database
    const insertedAddresses = insertUser(payId, addresses)

    // THEN we get a DatabaseError with our expected error message
    return assert.isRejected(
      insertedAddresses,
      DatabaseError,
      DatabaseErrorMessage.UniqueConstraintAddress,
    )
  })
})
