import katex from "katex";
import { notFound } from "next/navigation";
import { Inko, type InkoPose } from "@/components/mascot/inko";
import { LessonCompleteCard } from "@/components/celebrate/lesson-complete-card";
import { XpGain } from "@/components/celebrate/xp-gain";
import { Greeting } from "@/components/dashboard/greeting";
import { ContinueCard, ReviewTodayCard, WeekCard } from "@/components/dashboard/today-cards";
import { CodeBlock } from "@/components/lesson/code-block";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Toggle } from "@/components/ui/toggle";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

// Dev-only reference sheet for the Arcade design system (docs/design-system.md).
// Copy is English-only on purpose: production builds 404 here.

const SWATCHES = [
  "background", "card", "foreground", "muted-foreground", "border", "secondary",
  "primary", "primary-edge", "link", "coral", "coral-edge", "sun", "sun-edge",
  "mint", "mint-edge", "sky", "destructive", "ring",
];
const POSES: InkoPose[] = ["idle", "wave", "cheer", "think", "surprised", "sleep"];
const VARIANTS = ["default", "secondary", "coral", "outline", "ghost", "destructive", "link"] as const;
const SIZES = ["xs", "sm", "default", "lg"] as const;

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-2xl">{title}</h2>
      {children}
    </section>
  );
}

export default function StylePage() {
  if (process.env.NODE_ENV === "production") notFound();
  const math = katex.renderToString("\\vec{n} = \\frac{\\vec{v}}{\\lVert \\vec{v} \\rVert}", { displayMode: true });

  return (
    <main id="main-content" tabIndex={-1} className="container mx-auto flex flex-col gap-12 px-4 py-10">
      <header className="flex items-center gap-6">
        <Inko pose="wave" size={120} label="Inko waving" />
        <div>
          <h1 className="text-5xl leading-none">Arcade style sheet</h1>
          <p className="text-muted-foreground mt-2 text-lg">Tokens, primitives and Inko. Toggle the theme to check dark mode.</p>
        </div>
      </header>

      <Section title="Colour tokens">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {SWATCHES.map((name) => (
            <div key={name} className="edge-card bg-card overflow-hidden rounded-xl">
              <div className="h-14" style={{ background: `var(--${name})` }} />
              <p className="px-3 py-2 font-mono text-xs">--{name}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Type">
        <p className="font-heading text-5xl leading-tight font-extrabold">Baloo 2 · Tiêu đề 48</p>
        <p className="font-heading text-3xl font-bold">Baloo 2 · Mục lớn 30</p>
        <p className="font-heading text-2xl font-bold">Baloo 2 · Mục 24 (smallest Baloo size)</p>
        <p className="text-lg leading-[1.7]">Nunito 18 / 1.7 — reading text. Vectơ pháp tuyến được chuẩn hoá trước khi tính ánh sáng.</p>
        <p className="text-sm">Nunito 14 — UI text, labels and metadata.</p>
        <p className="chunky-label text-sm">Chunky label · buttons and nav only</p>
        <p className="font-mono text-sm">JetBrains Mono · vec3 n = normalize(vNormal);</p>
      </Section>

      <Section title="Buttons">
        {SIZES.map((size) => (
          <div key={size} className="flex flex-wrap items-center gap-3">
            {VARIANTS.map((variant) => (
              <Button key={variant} variant={variant} size={size}>{variant}</Button>
            ))}
            <Button size={size} disabled>disabled</Button>
          </div>
        ))}
      </Section>

      <Section title="Badges">
        <div className="flex flex-wrap gap-2">
          {(["default", "secondary", "coral", "sun", "mint", "outline", "destructive"] as const).map((v) => (
            <Badge key={v} variant={v}>{v}</Badge>
          ))}
        </div>
      </Section>

      <Section title="Cards">
        <div className="grid gap-5 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Continue: Vector basics</CardTitle>
              <CardDescription>Module 0 · 12 min left</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <Progress value={62} aria-label="Lesson progress" />
              <Button>Continue</Button>
            </CardContent>
          </Card>
          <Card size="sm">
            <CardHeader>
              <CardTitle>Small card</CardTitle>
              <CardDescription>With a footer.</CardDescription>
            </CardHeader>
            <CardContent>Body text inside a small card.</CardContent>
            <CardFooter><Button variant="secondary" size="sm">Secondary</Button></CardFooter>
          </Card>
          <div className="flex flex-col gap-3">
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-24" />
            <Alert>
              <AlertTitle>Heads up</AlertTitle>
              <AlertDescription>This lesson builds on Cartesian space.</AlertDescription>
            </Alert>
            <Alert variant="destructive">
              <AlertTitle>Could not save</AlertTitle>
              <AlertDescription>Check your connection and try again.</AlertDescription>
            </Alert>
          </div>
        </div>
      </Section>

      <Section title="Inputs">
        <div className="grid max-w-3xl gap-4 md:grid-cols-2">
          <Input aria-label="Email" placeholder="you@example.com" />
          <Select defaultValue="medium" items={{ low: "Low", medium: "Medium", high: "High" }}>
            <SelectTrigger aria-label="Graphics quality" className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
          <Textarea aria-label="Note" placeholder="Write a note…" />
          <div className="flex flex-col gap-4">
            <label className="flex items-center gap-2 text-sm"><Checkbox defaultChecked /> Remember me</label>
            <label className="flex items-center gap-2 text-sm"><Switch defaultChecked /> Reduced effects</label>
            <span id="style-volume" className="text-sm">Volume</span>
            <Slider defaultValue={[40]} aria-labelledby="style-volume" />
            <Toggle aria-label="Bold" defaultPressed>Bold</Toggle>
          </div>
        </div>
        <Tabs defaultValue="theory" className="max-w-md">
          <TabsList>
            <TabsTrigger value="theory">Theory</TabsTrigger>
            <TabsTrigger value="exercises">Exercises</TabsTrigger>
          </TabsList>
          <TabsContent value="theory">Theory panel.</TabsContent>
          <TabsContent value="exercises">Exercises panel.</TabsContent>
        </Tabs>
        <Accordion className="max-w-md">
          <AccordionItem value="m0">
            <AccordionTrigger>Module 0 · Math</AccordionTrigger>
            <AccordionContent>Cartesian space, vectors, dot product.</AccordionContent>
          </AccordionItem>
          <AccordionItem value="m1">
            <AccordionTrigger>Module 1 · Matrices</AccordionTrigger>
            <AccordionContent>Transforms and spaces.</AccordionContent>
          </AccordionItem>
        </Accordion>
      </Section>

      <Section title="Overlays">
        <div className="flex flex-wrap gap-3">
          <Dialog>
            <DialogTrigger render={<Button variant="secondary" />}>Dialog</DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Reset progress?</DialogTitle>
                <DialogDescription>Your notes stay. Lesson progress starts over.</DialogDescription>
              </DialogHeader>
              <DialogFooter showCloseButton><Button variant="coral">Reset</Button></DialogFooter>
            </DialogContent>
          </Dialog>
          <Popover>
            <PopoverTrigger render={<Button variant="secondary" />}>Popover</PopoverTrigger>
            <PopoverContent>Popover body text.</PopoverContent>
          </Popover>
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="secondary" />}>Menu</DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Account</DropdownMenuLabel>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem variant="destructive">Sign out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Tooltip>
            <TooltipTrigger render={<Button variant="outline" />}>Tooltip</TooltipTrigger>
            <TooltipContent>Ctrl K opens search</TooltipContent>
          </Tooltip>
        </div>
      </Section>

      <Section title="Reading column (stays calm)">
        <article className="max-w-[70ch] text-lg leading-[1.7]">
          <p>A <strong>normal</strong> is a vector perpendicular to a surface. Divide by its length to get a unit vector, written <code className="bg-muted rounded px-1.5 py-0.5 font-mono text-sm">normalize(v)</code>:</p>
          <div dangerouslySetInnerHTML={{ __html: math }} />
          <CodeBlock language="glsl" tabIndex={0}><code>{"vec3 n = normalize(vNormal);\nfloat light = max(dot(n, lightDir), 0.0);"}</code></CodeBlock>
        </article>
      </Section>

      <Section title="Dashboard (sample data)">
        <Greeting streak={4} nextTitle="Dot, Cross & Normalize" />
        <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3">
          <ContinueCard
            lesson={{ slug: "dot-and-cross-products", title: "Dot, Cross & Normalize", track: "Math Foundations", n: 3, m: 14 }}
            scrollPercent={0.42}
          />
          <ReviewTodayCard due={3} />
          <WeekCard streak={4} week={[true, true, false, true, true, false, false]} />
        </div>
        <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3">
          <ContinueCard />
          <ReviewTodayCard due={0} nextDays={2} />
          <ReviewTodayCard due={0} />
        </div>
      </Section>

      <Section title="Celebrations">
        <XpGain amount={5} />
        <LessonCompleteCard status="Completed · confidence 4/5" next={{ slug: "dot-and-cross-products", title: "Dot, Cross & Normalize" }} moduleDone={false} />
        <LessonCompleteCard status="Completed" moduleDone />
      </Section>

      <Section title="Inko">
        <div className="flex flex-wrap items-end gap-8">
          {POSES.map((pose) => (
            <figure key={pose} className="flex flex-col items-center gap-2">
              <Inko pose={pose} size={140} label={`Inko ${pose}`} />
              <figcaption className="text-muted-foreground font-mono text-xs">{pose}</figcaption>
            </figure>
          ))}
        </div>
      </Section>
    </main>
  );
}
