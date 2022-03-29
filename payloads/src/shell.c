#include <stdio.h>
#include <unistd.h>
#include <sys/types.h>

int main()
{
	setuid(geteuid());
	system("/bin/bash");
	return 0;
}