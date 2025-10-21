
// this file is generated — do not edit it


declare module "svelte/elements" {
	export interface HTMLAttributes<T> {
		'data-sveltekit-keepfocus'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-noscroll'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-preload-code'?:
			| true
			| ''
			| 'eager'
			| 'viewport'
			| 'hover'
			| 'tap'
			| 'off'
			| undefined
			| null;
		'data-sveltekit-preload-data'?: true | '' | 'hover' | 'tap' | 'off' | undefined | null;
		'data-sveltekit-reload'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-replacestate'?: true | '' | 'off' | undefined | null;
	}
}

export {};


declare module "$app/types" {
	export interface AppTypes {
		RouteId(): "/" | "/api" | "/api/auth" | "/api/auth/change-password" | "/api/auth/login" | "/api/auth/register" | "/history" | "/history/all" | "/inbound" | "/inbound/current" | "/inbound/daily" | "/inbound/history" | "/inbound/register" | "/inbound/stock-status" | "/login" | "/logout" | "/master" | "/master/codes" | "/master/items" | "/modal-examples" | "/outbound" | "/outbound/history" | "/outbound/register" | "/system" | "/system/users" | "/users" | "/users/account" | "/users/approval" | "/users/management" | "/users/notifications";
		RouteParams(): {
			
		};
		LayoutParams(): {
			"/": Record<string, never>;
			"/api": Record<string, never>;
			"/api/auth": Record<string, never>;
			"/api/auth/change-password": Record<string, never>;
			"/api/auth/login": Record<string, never>;
			"/api/auth/register": Record<string, never>;
			"/history": Record<string, never>;
			"/history/all": Record<string, never>;
			"/inbound": Record<string, never>;
			"/inbound/current": Record<string, never>;
			"/inbound/daily": Record<string, never>;
			"/inbound/history": Record<string, never>;
			"/inbound/register": Record<string, never>;
			"/inbound/stock-status": Record<string, never>;
			"/login": Record<string, never>;
			"/logout": Record<string, never>;
			"/master": Record<string, never>;
			"/master/codes": Record<string, never>;
			"/master/items": Record<string, never>;
			"/modal-examples": Record<string, never>;
			"/outbound": Record<string, never>;
			"/outbound/history": Record<string, never>;
			"/outbound/register": Record<string, never>;
			"/system": Record<string, never>;
			"/system/users": Record<string, never>;
			"/users": Record<string, never>;
			"/users/account": Record<string, never>;
			"/users/approval": Record<string, never>;
			"/users/management": Record<string, never>;
			"/users/notifications": Record<string, never>
		};
		Pathname(): "/" | "/api" | "/api/" | "/api/auth" | "/api/auth/" | "/api/auth/change-password" | "/api/auth/change-password/" | "/api/auth/login" | "/api/auth/login/" | "/api/auth/register" | "/api/auth/register/" | "/history" | "/history/" | "/history/all" | "/history/all/" | "/inbound" | "/inbound/" | "/inbound/current" | "/inbound/current/" | "/inbound/daily" | "/inbound/daily/" | "/inbound/history" | "/inbound/history/" | "/inbound/register" | "/inbound/register/" | "/inbound/stock-status" | "/inbound/stock-status/" | "/login" | "/login/" | "/logout" | "/logout/" | "/master" | "/master/" | "/master/codes" | "/master/codes/" | "/master/items" | "/master/items/" | "/modal-examples" | "/modal-examples/" | "/outbound" | "/outbound/" | "/outbound/history" | "/outbound/history/" | "/outbound/register" | "/outbound/register/" | "/system" | "/system/" | "/system/users" | "/system/users/" | "/users" | "/users/" | "/users/account" | "/users/account/" | "/users/approval" | "/users/approval/" | "/users/management" | "/users/management/" | "/users/notifications" | "/users/notifications/";
		ResolvedPathname(): `${"" | `/${string}`}${ReturnType<AppTypes['Pathname']>}`;
		Asset(): "/images/boyack.png" | string & {};
	}
}