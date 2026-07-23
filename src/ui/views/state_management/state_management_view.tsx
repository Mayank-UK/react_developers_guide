import { SectionWrapper } from '../../components/section-wrapper';
import { ContentGroupWrapper } from '../../components/content-group-wrapper';
import { TextBlock } from '../../components/text-block';
import { CodeBlock } from '../../components/code-block';
import LinkCard from '../../components/link_card';
import { useStateManagementViewModel } from './state_management_viewmodel';

/**
 * StateManagementView — hub for the state-management section.
 *
 * Before the link grid, this screen frames the single most useful idea: "state
 * management" is not one problem. It is three, and React has a different best
 * tool for each. Pick the tool by the kind of state you're holding, not by what
 * is trendy. Every sub-screen below implements the SAME todo example so you can
 * compare the mechanism, not the feature set.
 */
export default function StateManagementView() {
    const { NAV_ITEMS } = useStateManagementViewModel();

    return (
        <div className="flex flex-col gap-md">
            <SectionWrapper title="Which state are you managing?">
                <ContentGroupWrapper title="Three kinds of state, three tools">
                    <TextBlock>
                        {`"State management" gets treated as one topic, but a React app actually
holds three very different kinds of state, and the right tool depends on which
one you're holding:

1. LOCAL COMPONENT STATE — form values, a toggle, the open/closed menu. Lives in
   one component and dies with it. useState / useReducer. No library. This is
   90% of state in a well-factored app.

2. GLOBAL CLIENT STATE — state shared across distant parts of the tree: the
   logged-in user, a theme, a cart, filters. Prop-drilling it is painful.
   Zustand (small, hook-based) is the modern default; Redux (Redux Toolkit)
   when the app is large, the team is big, and you want strict predictability
   and middleware/devtools.

3. SERVER STATE — data that actually lives on a server: lists of posts, a user
   profile, search results. It is NOT yours: it can be stale, it can be loading,
   it can fail, someone else can change it. This is what TanStack Query is for —
   caching, refetching, loading/error tracking, invalidation. It is a complement
   to client state, not a replacement.`}
                    </TextBlock>
                    <CodeBlock
                        language="text"
                        caption={
                            <span className="text-caption text-on-surface-variant">
                                The decision, in one line.
                            </span>
                        }
                        code={`local to one component?      → useState / useReducer
shared across the tree?      → Zustand  (Redux Toolkit if large/strict)
comes from a server?         → TanStack Query`}
                    />
                </ContentGroupWrapper>
                <ContentGroupWrapper title="One todo, four ways">
                    <TextBlock>
                        {`Every screen below builds the same todo app — add, toggle, remove,
filter — with a different tool. Read the Hooks screen first (it is the
foundation and the fallback for almost everything), then see how Redux,
Zustand, and TanStack Query each trade ceremony for power.`}
                    </TextBlock>
                </ContentGroupWrapper>
            </SectionWrapper>

            <nav className="grid grid-cols-1 gap-md pb-md sm:grid-cols-2 lg:grid-cols-3">
                {NAV_ITEMS.map((item) => (
                    <LinkCard key={item.route} item={item} />
                ))}
            </nav>
        </div>
    );
}
