import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

import User from '@models/user';
import connectToDatabase  from '@utils/database';

// console.log({
//     clientId: process.env.GOOGLE_ID,
//     clientSecret: process.env.GOOGLE_CLIENT_SECRET
// })

export const authOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET
        })
    ],
    callbacks: {
        async session({ session }) {
            await connectToDatabase();
            
            const sessionUser = await User.findOne({
                email: session.user.email
            })
    
            session.user.id = sessionUser._id.toString();
    
            return session;
        },
        async signIn({ profile }) {
            try {
                await connectToDatabase();
    
                // check if a user already exists
                const userExists = await User.findOne({
                    email: profile.email
                });

                let profileName = profile.name ? profile.name.replace(" ", "").toLowerCase() : profile.email;

                // if not, create a new user
                if (!userExists) {
                    await User.create({
                        email: profile.email,
                        username: profileName,
                        image: profile.picture
                    })
                }
    
                return true;
            } catch (error) {
                console.log(error);
                return false;
            }
        }
    }
    
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST };