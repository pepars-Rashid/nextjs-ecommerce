import { StackHandler, StackProvider, StackTheme } from "@stackframe/stack";
import { stackServerApp } from "@/stack-server";

export default function Page(props: {
	params: { stack?: string[] };
	searchParams: Record<string, string>;
}) {
	return (
		<StackProvider app={stackServerApp}>
			<StackTheme>
				<StackHandler app={stackServerApp} fullPage routeProps={props} />
			</StackTheme>
		</StackProvider>
	);
} 