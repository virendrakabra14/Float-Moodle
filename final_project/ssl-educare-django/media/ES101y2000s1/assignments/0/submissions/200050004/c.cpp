#include<bits/stdc++.h>
using namespace std;
int main(int argc, char *argv[]){
    long long t, x, k;
    double y;
    cin>>t;
    while(t--){
        cin>>k>>x;
        if(x>k*k){
            cout<<2*k-1<<"\n";
        }
        else if(x<=(k*(k+1)/2)){
            // cout<<"Here";
            y = (-1+sqrt(1.0+8.0*x))/2;
            if(abs((long long)(y)- y)<0.00001){
            cout<<(long long)(y)<<"\n";
            }
            else{
            cout<<(long long)(y)+1<<"\n";
            }

            // cout<<y - int()<<"\n";
        }
        else{
            cout<<max(k+1,1+(long long)(2*k - (sqrt(4.0*k*k - 2.0*(x + k*k - k)))))<<"\n";
        }
    }
}