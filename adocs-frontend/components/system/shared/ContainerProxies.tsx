"use client";
import DomainLink from "@/components/system/shared/DomainLink";
import { DomainScope } from "@/components/system/shared/DomainList";
import RecordStatus from "@/components/system/shared/RecordStatus";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "@/components/ui/input-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight, Lock, LockOpen, Plus, Server, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const PUBLIC_DOMAIN = "adocs.site";

export type ContainerProxy = {
  id: number;
  domains: string[];
  forwardScheme: string;
  forwardHost: string;
  forwardPort: number;
  enabled: boolean;
  ssl: boolean;
  primary: boolean;
};

const NEW_PROXY = "new";
const proxyLabel = (proxy: ContainerProxy) => (proxy.primary ? "Deploy proxy host" : "Proxy host") + " #" + proxy.id;

export default function ContainerProxies({ containerName, deployDomain, proxies, synced, canManage, defaultPort, defaultProtocol, pending, onAction, onChanged }: {
  containerName: string;
  deployDomain?: string | null;
  proxies: ContainerProxy[];
  synced: boolean;
  canManage: boolean;
  defaultPort?: string | null;
  defaultProtocol?: string | null;
  pending: boolean;
  onAction: (action: () => Promise<void>) => Promise<void>;
  onChanged: () => Promise<void>;
}) {
  const [subdomain, setSubdomain] = useState("");
  // New domains join the deploy proxy host bound to npm_id unless another target is chosen.
  const [target, setTarget] = useState(String((proxies.find((proxy) => proxy.primary) ?? proxies[0])?.id ?? NEW_PROXY));
  const [port, setPort] = useState(defaultPort ? String(defaultPort) : "");
  const [protocol, setProtocol] = useState(defaultProtocol?.toLowerCase() || "http");
  const targetProxy = proxies.find((proxy) => String(proxy.id) === target);
  const activeTarget = targetProxy ? target : NEW_PROXY;
  const domain = (subdomain || "name") + "." + PUBLIC_DOMAIN;

  const toAddDomain = async () => {
    const toastID = toast.loading("Adding domain...");
    try {
      const res = await fetch(`/api/containers/${encodeURIComponent(containerName)}/proxies`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(targetProxy ? { subdomain, proxyId: targetProxy.id } : { subdomain, port, protocol }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error("Error", { id: toastID, description: data.error });
        return;
      }
      toast.success("Domain added", { id: toastID, description: data.message });
      setSubdomain("");
      await onChanged();
    } catch {
      toast.dismiss(toastID);
      toast.error("Error", { description: "Server Error 500" });
    }
  };
  const toRemoveDomain = async (proxy: ContainerProxy, value: string) => {
    const toastID = toast.loading("Removing domain...");
    try {
      const res = await fetch(`/api/containers/${encodeURIComponent(containerName)}/proxies/${proxy.id}/domains/${encodeURIComponent(value)}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        toast.error("Error", { id: toastID, description: data.error });
        return;
      }
      toast.success("Domain removed", { id: toastID, description: data.message });
      await onChanged();
    } catch {
      toast.dismiss(toastID);
      toast.error("Error", { description: "Server Error 500" });
    }
  };

  return (
    <section className="space-y-3 border-t pt-5" aria-label="Domains">
      <div className="flex items-center gap-2.5">
        <h3 className="text-sm font-medium">Domains</h3>
        <span className="rounded-full bg-muted px-2 py-0.5 text-xs tabular-nums text-muted-foreground">{proxies.reduce((total, proxy) => total + proxy.domains.length, 0)}</span>
      </div>
      {!synced && <p role="status" className="rounded-xl bg-amber-500/10 px-4 py-3 text-xs text-amber-700 dark:text-amber-400">Nginx Proxy Manager is unreachable.</p>}
      {proxies.length === 0 ? (
        <p className="rounded-xl border border-dashed px-4 py-6 text-center text-xs text-muted-foreground">No domains yet.</p>
      ) : (
        <div className="space-y-3">
          {proxies.map((proxy) => (
            <div key={proxy.id} className="overflow-hidden rounded-xl border">
              <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 bg-muted/50 px-4 py-2">
                <div className="flex min-w-0 items-center gap-2">
                  <Server className="size-3.5 shrink-0 text-sky-500" aria-hidden="true" />
                  <span className="truncate text-xs font-medium">{proxyLabel(proxy)}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  {!proxy.enabled && <RecordStatus status="Disabled" tone="danger" />}
                  <span className="inline-flex items-center gap-1.5"><ArrowRight className="size-3.5" aria-hidden="true" />{(proxy.forwardScheme || "http").toUpperCase()} · {proxy.forwardPort ?? "-"}</span>
                  <span title={proxy.ssl ? "SSL" : "No SSL"}>{proxy.ssl ? <Lock className="size-3.5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" /> : <LockOpen className="size-3.5" aria-hidden="true" />}<span className="sr-only">{proxy.ssl ? "SSL" : "No SSL"}</span></span>
                </div>
              </div>
              <ul className="divide-y">
                {proxy.domains.map((value) => {
                  const locked = proxy.primary && value === deployDomain;
                  const last = proxy.domains.length === 1;
                  return (
                    <li key={value} className="flex min-h-11 min-w-0 items-center justify-between gap-3 px-4 py-2">
                      <span className="flex min-w-0 flex-wrap items-center gap-2 text-sm [&_a]:max-w-full [&_a>span]:min-w-0">
                        <DomainLink domain={value} /><DomainScope domain={value} />
                      </span>
                      {canManage && !locked && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button type="button" variant="ghost" size="icon-sm" disabled={pending} className="shrink-0 text-muted-foreground hover:text-destructive" aria-label={"Remove domain " + value}><X aria-hidden="true" /></Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle className="break-all">Remove {value}?</AlertDialogTitle>
                              <AlertDialogDescription>{last && !proxy.primary ? "Its proxy host will be deleted too." : "It will stop forwarding to this container."}</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction variant="destructive" onClick={() => { void onAction(() => toRemoveDomain(proxy, value)); }}>Remove domain</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      )}
      {canManage && (
        <form className="space-y-4 rounded-xl border p-4" onSubmit={(event) => { event.preventDefault(); void onAction(toAddDomain); }}>
          <div className="space-y-1">
            <p className="text-sm font-medium">Add public domain</p>
            <p className="text-xs text-muted-foreground">Add a .{PUBLIC_DOMAIN} domain to an existing proxy host or create a new one.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="proxy-subdomain">Public domain</FieldLabel>
              <InputGroup className="h-10">
                <InputGroupInput id="proxy-subdomain" placeholder="my-app" value={subdomain} disabled={pending} autoComplete="off" spellCheck={false} onChange={(event) => setSubdomain(event.target.value.toLowerCase().replace(/\s/g, ""))} />
                <InputGroupAddon align="inline-end"><InputGroupText>.{PUBLIC_DOMAIN}</InputGroupText></InputGroupAddon>
              </InputGroup>
            </Field>
            <Field>
              <FieldLabel htmlFor="proxy-target">Add to</FieldLabel>
              <Select value={activeTarget} onValueChange={setTarget} disabled={pending}>
                <SelectTrigger id="proxy-target" className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {proxies.map((proxy) => <SelectItem key={proxy.id} value={String(proxy.id)}>{proxyLabel(proxy)}</SelectItem>)}
                  <SelectItem value={NEW_PROXY}>New proxy host</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>
          {!targetProxy && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="proxy-protocol">Protocol</FieldLabel>
                <Select value={protocol} onValueChange={setProtocol} disabled={pending}><SelectTrigger id="proxy-protocol" className="w-full"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="http">HTTP</SelectItem><SelectItem value="https">HTTPS</SelectItem></SelectContent></Select>
              </Field>
              <Field>
                <FieldLabel htmlFor="proxy-port">Port</FieldLabel>
                <Input id="proxy-port" inputMode="numeric" value={port} disabled={pending} onChange={(event) => setPort(event.target.value)} className="h-10 shadow-none" />
              </Field>
            </div>
          )}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <FieldDescription className="break-all text-xs">
              {targetProxy ? domain + " joins " + proxyLabel(targetProxy) + " and uses its SSL certificate." : domain + " forwards to " + protocol.toUpperCase() + " · Port " + (port || "-") + " on a new proxy host."}
            </FieldDescription>
            <Button type="submit" disabled={pending || !subdomain} className="shrink-0 gap-2"><Plus aria-hidden="true" />Add domain</Button>
          </div>
        </form>
      )}
    </section>
  );
}
