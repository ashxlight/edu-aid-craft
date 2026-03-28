import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const Settings = () => (
  <div className="flex-1 p-4 md:p-8 space-y-8 max-w-3xl mx-auto w-full">
    <div className="space-y-2">
      <h1 className="text-4xl font-serif text-foreground">
        <span className="heading-underline">Settings</span>
      </h1>
      <p className="text-muted-foreground">Manage your account and preferences.</p>
    </div>

    <div className="bg-popover rounded-2xl p-6 border border-border/50">
      <h3 className="font-bold text-foreground text-lg mb-4 font-sans">Profile</h3>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Display Name</Label>
          <Input defaultValue="Teacher Jane" className="h-11 rounded-xl bg-card" />
        </div>
        <div className="space-y-2">
          <Label>Email</Label>
          <Input defaultValue="jane@school.edu" className="h-11 rounded-xl bg-card" />
        </div>
        <Button className="bg-teal hover:bg-teal-dark text-primary-foreground rounded-full px-6 font-semibold">
          Save Changes
        </Button>
      </div>
    </div>

    <div className="bg-popover rounded-2xl p-6 border border-border/50">
      <h3 className="font-bold text-foreground text-lg mb-4 font-sans">Preferences</h3>
      <div className="space-y-3">
        {[
          { id: "large-text", label: "Large Text Mode", desc: "Increase font size across the app" },
          { id: "high-contrast", label: "High Contrast", desc: "Enhanced contrast for better readability" },
          { id: "notifications", label: "Email Notifications", desc: "Get notified when conversions complete" },
        ].map((pref) => (
          <div key={pref.id} className="flex items-center justify-between p-4 rounded-2xl bg-card">
            <div>
              <Label htmlFor={pref.id} className="font-semibold text-foreground cursor-pointer">{pref.label}</Label>
              <p className="text-xs text-muted-foreground mt-0.5">{pref.desc}</p>
            </div>
            <Switch id={pref.id} />
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default Settings;
