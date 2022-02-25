let constants = {
// MsgRegister - Initial message from sliver with metadata
	MsgRegister: 1,

	// MsgTaskReq - A local shellcode injection task
	MsgTaskReq: 2,

	// MsgPing - Confirm connection is open used as req/resp
	MsgPing: 3,

	// MsgKillSessionReq - Kill request to the sliver process
	MsgKillSessionReq: 4,

	// MsgLsReq - Request a directory listing from the remote system
	MsgLsReq: 5,
	// MsgLs - Directory listing (resp to MsgDirListReq)
	MsgLs: 6,

	// MsgDownloadReq - Request to download a file from the remote system
	MsgDownloadReq: 7,
	// MsgDownload - File contents for download (resp to DownloadReq)
	MsgDownload: 8,

	// MsgUploadReq - Upload a file to the remote file system
	MsgUploadReq: 9,
	// MsgUpload - Confirms the success/failure of the file upload (resp to MsgUploadReq)
	MsgUpload: 10,

	// MsgCdReq - Request a change directory on the remote system
	MsgCdReq: 11,

	// MsgPwdReq - A request to get the CWD from the remote process
	MsgPwdReq: 12,
	// MsgPwd - The CWD of the remote process (resp to MsgPwdReq)
	MsgPwd: 13,

	// MsgRmReq - Request to delete remote file
	MsgRmReq: 14,
	// MsgRm - Confirms the success/failure of delete request (resp to MsgRmReq)
	MsgRm: 15,

	// MsgMkdirReq - Request to create a directory on the remote system
	MsgMkdirReq: 16,
	// MsgMkdir - Confirms the success/failure of the mkdir request (resp to MsgMkdirReq)
	MsgMkdir: 17,

	// MsgPsReq - List processes req
	MsgPsReq: 18,
	// MsgPs - List processes resp
	MsgPs: 19,

	// MsgShellReq - Request to open a shell tunnel
	MsgShellReq: 20,
	// MsgShell - Response on starting shell
	MsgShell: 21,

	// MsgTunnelData - Data for duplex tunnels
	MsgTunnelData: 22,
	// MsgTunnelClose - Close a duplex tunnel
	MsgTunnelClose: 23,

	// MsgProcessDumpReq - Request to create a process dump
	MsgProcessDumpReq: 24,
	// MsgProcessDump - Dump of process)
	MsgProcessDump: 25,
	// MsgImpersonateReq - Request for process impersonation
	MsgImpersonateReq: 26,
	// MsgImpersonate - Output of the impersonation command
	MsgImpersonate: 27,
	// MsgRunAsReq - Request to run process as user
	MsgRunAsReq: 28,
	// MsgRunAs - Run process as user
	MsgRunAs: 29,
	// MsgRevToSelf - Revert to self
	MsgRevToSelf: 30,
	// MsgRevToSelfReq - Request to revert to self
	MsgRevToSelfReq: 31,
	// MsgInvokeGetSystemReq - Elevate as SYSTEM user
	MsgInvokeGetSystemReq: 32,
	// MsgGetSystem - Response to getsystem request
	MsgGetSystem: 33,
	// MsgInvokeExecuteAssemblyReq - Request to load and execute a .NET assembly
	MsgInvokeExecuteAssemblyReq: 34,
	// MsgExecuteAssemblyReq - Request to load and execute a .NET assembly
	MsgExecuteAssemblyReq: 35,
	// MsgExecuteAssembly - Output of the assembly execution
	MsgExecuteAssembly: 36,
	// MsgInvokeMigrateReq - Spawn a new sliver in a designated process
	MsgInvokeMigrateReq: 37,

	// MsgSideloadReq - request to sideload a binary
	MsgSideloadReq: 38,
	// MsgSideload - output of the binary
	MsgSideload: 39,

	// MsgSpawnDllReq - Reflective DLL injection request
	MsgSpawnDllReq: 40,
	// MsgSpawnDll - Reflective DLL injection output
	MsgSpawnDll: 41,

	// MsgIfconfigReq - Ifconfig (network interface config) request
	MsgIfconfigReq: 42,
	// MsgIfconfig - Ifconfig response
	MsgIfconfig: 43,

	// MsgExecuteReq - Execute a command on the remote system
	MsgExecuteReq: 44,

	// MsgTerminateReq - Request to kill a remote process
	MsgTerminateReq: 45,

	// MsgTerminate - Kill a remote process
	MsgTerminate: 46,

	// MsgScreenshotReq - Request to take a screenshot
	MsgScreenshotReq: 47,

	// MsgScreenshot - Response with the screenshots
	MsgScreenshot: 48,

	// MsgNetstatReq - Netstat request
	MsgNetstatReq: 49,

	// *** Pivots ***

	// MsgPivotStartListenerReq - Start a listener
	MsgPivotStartListenerReq: 50,
	// MsgPivotStopListenerReq - Stop a listener
	MsgPivotStopListenerReq: 51,
	// MsgPivotListenersReq - List listeners request
	MsgPivotListenersReq: 52,
	// MsgPivotListeners - List listeners response
	MsgPivotListeners: 53,
	// MsgPivotPeerPing - Pivot peer ping message
	MsgPivotPeerPing: 54,
	// MsgPivotServerPing - Pivot peer ping message
	MsgPivotServerPing: 55,
	// PivotServerKeyExchange - Pivot to server key exchange
	MsgPivotServerKeyExchange: 56,
	// MsgPivotPeerEnvelope - An envelope from a pivot peer
	MsgPivotPeerEnvelope: 57,
	// MsgPivotPeerFailure - Failure to send an envelope to a pivot peer
	MsgPivotPeerFailure: 58,
	// MsgPivotSessionEnvelope
	MsgPivotSessionEnvelope: 59,

	// MsgStartServiceReq - Request to start a service
	MsgStartServiceReq: 60,
	// MsgStartService - Response to start service request
	MsgStartService: 61,
	// MsgStopServiceReq - Request to stop a remote service
	MsgStopServiceReq: 62,
	// MsgRemoveServiceReq - Request to remove a remote service
	MsgRemoveServiceReq: 63,
	// MsgMakeTokenReq - Request for MakeToken
	MsgMakeTokenReq: 64,
	// MsgMakeToken - Response for MakeToken
	MsgMakeToken: 65,
	// MsgEnvReq - Request to get environment variables
	MsgEnvReq: 66,
	// MsgEnvInfo - Response to environment variable request
	MsgEnvInfo: 67,
	// MsgSetEnvReq
	MsgSetEnvReq: 68,
	// MsgSetEnv
	MsgSetEnv: 69,
	// MsgExecuteTokenReq - Execute request executed with the current (Windows) token
	MsgExecuteTokenReq: 70,
	// MsgRegistryReadReq
	MsgRegistryReadReq: 71,
	// MsgRegistryWriteReq
	MsgRegistryWriteReq: 72,
	// MsgRegistryCreateKeyReq
	MsgRegistryCreateKeyReq: 73,

	// MsgWGStartPortFwdReq - Request to start a port forwarding in a WG transport
	MsgWGStartPortFwdReq: 74,
	// MsgWGStopPortFwdReq - Request to stop a port forwarding in a WG transport
	MsgWGStopPortFwdReq: 75,
	// MsgWGStartSocks - Request to start a socks server in a WG transport
	MsgWGStartSocksReq: 76,
	// MsgWGStopSocks - Request to stop a socks server in a WG transport
	MsgWGStopSocksReq: 77,
	// MsgWGListForwarders
	MsgWGListForwardersReq: 78,
	// MsgWGListSocks
	MsgWGListSocksReq: 79,

	// MsgPortfwdReq - Establish a port forward
	MsgPortfwdReq: 80,
	// MsgPortfwd - Response of port forward
	MsgPortfwd: 81,

	// MsgSocksData - Response of SocksData
	MsgSocksData: 82,

	// MsgReconfigureReq
	MsgReconfigureReq: 83,

	// MsgReconfigure - Set Reconfigure
	MsgReconfigure: 84,

	// MsgUnsetEnvReq
	MsgUnsetEnvReq: 85,

	// MsgSSHCommandReq - Run a SSH command
	MsgSSHCommandReq: 86,

	// MsgGetPrivsReq - Get privileges (Windows)
	MsgGetPrivsReq: 87,

	// MsgRegistryListReq - List registry sub keys
	MsgRegistrySubKeysListReq: 88,
	// MsgRegistryListValuesReq - List registry values
	MsgRegistryListValuesReq: 89,
	// MsgRegisterExtensionReq - Register a new extension
	MsgRegisterExtensionReq: 90,

	// MsgCallExtensionReq - Run an extension command
	MsgCallExtensionReq: 91,
	// MsgListExtensionsReq - List loaded extensions
	MsgListExtensionsReq: 92,

	// MsgBeaconRegister - Register a new beacon
	MsgBeaconRegister: 93,
	// MsgBeaconTasks - Send/recv batches of beacon tasks
	MsgBeaconTasks: 94,

	// MsgOpenSession - Open a new session
	MsgOpenSession: 95,
	// MsgCloseSession - Close the active session
	MsgCloseSession: 96,

	// MsgRegistryDeleteKeyReq
	MsgRegistryDeleteKeyReq: 97
}