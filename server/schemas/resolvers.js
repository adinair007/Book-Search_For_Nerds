const { AuthenticationError } = require("apollo-server-express");
const { User } = require("../models");
// import sign token function from auth
const { signToken } = require("../utils/auth");

const resolvers = {
  Query: {
    // By adding context to our query, we can retrieve the logged in user without specifically searching for them
    me: async (parent, args, context) => {
      if (context.user) {
        const user = await User.findOne({ _id: context.user._id })
          .select("-password -__v")
          .populate("savedBooks");
        return user;
      }
      throw new AuthenticationError("You need to be logged in!");
    },
  },

  Mutation: {
    addUser: async (parent, { username, email, password }) => {
      try {
        const user = await User.create({ username, email, password });

        if (!user) {
          throw new AuthenticationError("Unable to create this profile!");
        }
        const token = signToken(user);
        return { token, user };
      } catch (error) {
        throw new AuthenticationError("An error has occurred!");
      }
    },

    login: async (parent, args) => {
      const { email, password } = args;
      const user = await User.findOne({ email });
      if (!user) {
        throw new AuthenticationError(
          "Unable to find a profile with this email!"
        );
      }

      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        throw new AuthenticationError("Incorrect Password! Please try again.");
      }
      const token = signToken(user);
      return { token, user };
    },

    // Add a third argument to the resolver to access data in our `context`
    saveBook: async (parent, args, context) => {
      if (context.user) {
        const { bookData } = args;
        const updatedUser = await User.findOneAndUpdate(
          { _id: context.user._id },
          { $addToSet: { savedBooks: bookData } },
          { new: true, runValidators: true }
        );
        return updatedUser;
      }
      throw new AuthenticationError("Not logged in");
    },

    // Make it so a logged in user can only remove a book from their own profile
    deleteBook: async (parent, args, context) => {
      const { bookId } = args;
      if (context.user) {
        const updatedUser = await User.findOneAndUpdate(
          { _id: context.user._id },
          { $pull: { savedBooks: { bookId } } },
          { new: true }
        );
        return updatedUser;
      }
      throw new AuthenticationError("Not logged in");
    },
  },
};

module.exports = resolvers;
