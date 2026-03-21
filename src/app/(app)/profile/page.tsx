"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Mail,
  FileText,
  LogOut,
  Loader2,
  Calendar,
} from "lucide-react";

interface CV {
  id: string;
  targetRole: string;
  uploadedAt: string;
  fileName?: string;
}

export default function ProfilePage() {
  const { data: session } = useSession();
  const [cvs, setCvs] = useState<CV[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCVs() {
      try {
        const res = await fetch("/api/cv");
        if (res.ok) {
          const data = await res.json();
          setCvs(data.cvs || []);
        }
      } catch {
        // Silently fail
      } finally {
        setLoading(false);
      }
    }

    fetchCVs();
  }, []);

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Profile</h1>

      {/* User Info */}
      <Card className="mb-6">
        <CardContent className="p-5">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100">
              <User className="h-7 w-7 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                {session?.user?.name || "User"}
              </h2>
              <p className="flex items-center gap-1 text-sm text-slate-500">
                <Mail className="h-3.5 w-3.5" />
                {session?.user?.email || ""}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Uploaded CVs */}
      <div className="mb-6">
        <h3 className="mb-3 text-sm font-semibold uppercase text-slate-500">
          Your CVs
        </h3>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          </div>
        ) : cvs.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center py-8">
              <FileText className="mb-2 h-8 w-8 text-slate-300" />
              <p className="text-sm text-slate-500">No CVs uploaded yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {cvs.map((cv) => (
              <Card key={cv.id}>
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                    <FileText className="h-5 w-5 text-slate-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-slate-900">
                      {cv.targetRole || "CV"}
                    </p>
                    <p className="flex items-center gap-1 text-xs text-slate-400">
                      <Calendar className="h-3 w-3" />
                      {new Date(cv.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant="secondary" className="shrink-0 text-xs">
                    {cv.fileName?.split(".").pop()?.toUpperCase() || "PDF"}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Separator className="my-6" />

      {/* Sign Out */}
      <Button
        variant="outline"
        className="h-12 w-full text-red-600 hover:bg-red-50 hover:text-red-700"
        onClick={() => signOut({ callbackUrl: "/" })}
      >
        <LogOut className="mr-2 h-4 w-4" />
        Sign Out
      </Button>
    </div>
  );
}
