#include<bits/stdc++.h>
using namespace std;
int main(int argc, char *argv[]){
    int t,a,b,n;
    cin>>t;
    while(t--){
        cin>>n>>a>>b;
        if(a > ((n/2) + 1) || b < n/2){
            cout<<"-1\n";
        }
        else if(a==(n/2 + 1)||b==n/2){
            if(!(a==(n/2 + 1)&&b==n/2)){
                cout<<"-1\n";
            }
            else{
                for(int i=n/2+1;i<=n;i++){
                    cout<<i<<" ";
                }
                for(int i=1;i<=n/2;i++){
                    cout<<i<<" ";
                }
                cout<<"\n";
            }
        }
        else{
            for(int i=a;i<=(a+b-n/2-1);i++){
                cout<<i<<" ";
            }
            for(int i=b+1;i<=n;i++){
                cout<<i<<" ";
            }
            for(int i=1;i<=a-1;i++){
                cout<<i<<" ";
            }
            for(int i=(a + b - n/2);i<=b;i++){
                cout<<i<<" ";
            }
            cout<<"\n";
        }
    }
}