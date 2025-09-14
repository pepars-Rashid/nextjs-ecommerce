import { StackHandler, StackProvider, StackTheme } from "@stackframe/stack";
import { stackServerApp } from "@/stack-server";

type ParamsType = Promise<{ stack?: string[] }>;

type SearchParamsType = Promise<Record<string, string>>;


export default async function Page(props: {
	params: ParamsType;
  	searchParams: SearchParamsType;
}) {
	// Await both params and searchParams promises to resolve
  const [resolvedParams, resolvedSearchParams] = await Promise.all([
    props.params,
    props.searchParams,
  ]);
	return (
		<StackProvider app={stackServerApp}>
			<StackTheme>
				<StackHandler
    			  app={stackServerApp}
    			  fullPage
    			  routeProps={{
    			    ...props,
    			    params: resolvedParams,
    			    searchParams: resolvedSearchParams,
    			  }}
    			/>
			</StackTheme>
		</StackProvider>
	);
} 