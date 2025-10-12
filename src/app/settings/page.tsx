
"use client"

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useUser, useAuth, useFirestore } from "@/firebase"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { useToast } from "@/hooks/use-toast"
import { updateProfile } from "firebase/auth"
import { doc, setDoc } from "firebase/firestore"
import { Loader2 } from "lucide-react"
import Link from "next/link";

const profileFormSchema = z.object({
  displayName: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email(),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

export default function SettingsPage() {
  const { user } = useUser()
  const auth = useAuth()
  const firestore = useFirestore()
  const { toast } = useToast()
  const [subscriptionPlan, setSubscriptionPlan] = useState<"free" | "pro">("free");

  useEffect(() => {
    const storedPlan = localStorage.getItem("subscriptionPlan") as "free" | "pro";
    if (storedPlan) {
      setSubscriptionPlan(storedPlan);
    }
  }, []);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      displayName: user?.displayName || "",
      email: user?.email || "",
    },
    values: { // Use values to ensure the form is up-to-date with user state
      displayName: user?.displayName || "",
      email: user?.email || "",
    },
    mode: "onChange",
  })

  async function onSubmit(data: ProfileFormValues) {
    if (!user || !firestore || !auth) return

    try {
      // Update Firebase Auth profile
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: data.displayName })
      }

      // Update Firestore user document
      const userDocRef = doc(firestore, "users", user.uid)
      await setDoc(userDocRef, { displayName: data.displayName }, { merge: true })

      toast({
        title: "Profile updated",
        description: "Your display name has been updated successfully.",
      })
    } catch (error: any) {
      console.error("Error updating profile:", error)
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "There was a problem with your request.",
      })
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and application settings.
        </p>
      </div>

      <Card>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>
                This is your public display name.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="displayName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Your Email" {...field} disabled />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Subscription</CardTitle>
          <CardDescription>Manage your subscription plan.</CardDescription>
        </CardHeader>
        <CardContent>
            {subscriptionPlan === 'pro' ? (
              <p className="text-sm text-muted-foreground">You are currently on the <span className="font-semibold text-primary">Pro</span> plan.</p>
            ) : (
              <p className="text-sm text-muted-foreground">You are currently on the <span className="font-semibold text-foreground">Free</span> plan.</p>
            )}
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
            {subscriptionPlan === 'pro' ? (
                <Button asChild>
                  <Link href="/pricing">Manage Subscription</Link>
                </Button>
            ) : (
                <Button asChild>
                    <Link href="/pricing">Upgrade to Pro</Link>
                </Button>
            )}
        </CardFooter>
      </Card>
    </div>
  )
}
