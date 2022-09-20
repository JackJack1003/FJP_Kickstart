export const userSchema = {
  name: 'users',
  title: 'Users',
  type: 'document',
  fields: [
    {
      name: 'address',
      title: 'Wallet Address',
      type: 'string',
    },
    {
      name: 'userName',
      title: 'User Name',
      type: 'string',
    },
    {
      name: 'password',
      title: 'Password',
      type: 'string',
    },
    {
      name: 'salt',
      title: 'Salt',
      type: 'string',
    },
    {
      name: 'email',
      title: 'Email',
      type: 'string',
    },

    {
      name: 'transactions',
      title: 'Transactions',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{ type: 'transactions' }],
        },
      ],
    },
  ],
};
